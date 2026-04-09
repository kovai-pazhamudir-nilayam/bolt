import { spawn } from 'child_process'
import { shell } from 'electron'

// Store active processes to manage them
const activeProcesses = new Map()

export const registerShellHandler = (ipcMain) => {
  // Handle shell command execution
  ipcMain.handle('shell:run', async (event, command, options = {}) => {
    const { cwd = process.cwd(), env = process.env } = options
    const processId = Date.now().toString() // Simple ID generation
    const loginShell = process.env.SHELL || '/bin/zsh'

    return new Promise((resolve, reject) => {
      const child = spawn(loginShell, ['-l', '-c', command], {
        cwd,
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      // Store the process for potential cleanup
      activeProcesses.set(processId, child)

      let stdout = ''

      // Handle stdout
      child.stdout.on('data', (data) => {
        const output = data.toString()
        if (output) {
          stdout += output
          event.sender.send('shell:log', { processId, output, type: 'stdout' })
        }
      })

      // Handle stderr
      child.stderr.on('data', (data) => {
        const output = data.toString()
        if (output) {
          event.sender.send('shell:log', { processId, output, type: 'stderr' })
        }
      })

      // Handle process completion
      child.on('close', (code) => {
        activeProcesses.delete(processId)
        event.sender.send('shell:end', { processId, code })
        resolve({ processId, success: code === 0, code, stdout })
      })

      // Handle process errors
      child.on('error', (error) => {
        activeProcesses.delete(processId)
        event.sender.send('shell:log', {
          processId,
          output: `Error: ${error.message}`,
          type: 'error'
        })
        event.sender.send('shell:end', { processId, code: -1 })
        reject(error)
      })

      // Send process started message
      event.sender.send('shell:log', {
        processId,
        output: `Starting command: ${command}`,
        type: 'info'
      })
    })
  })

  // Handle process termination
  ipcMain.handle('shell:kill', async (event, processId) => {
    const process = activeProcesses.get(processId)
    if (process) {
      process.kill()
      activeProcesses.delete(processId)
      event.sender.send('shell:log', {
        processId,
        output: 'Process terminated by user',
        type: 'info'
      })
      return true
    }
    return false
  })

  // Handle getting active processes
  ipcMain.handle('shell:active-processes', async () => {
    return Array.from(activeProcesses.keys())
  })

  // Handle opening external URL in default browser
  ipcMain.handle('shell:openExternal', async (event, url) => {
    try {
      console.log('Opening external URL:', url)
      await shell.openExternal(url)
      return { success: true }
    } catch (error) {
      console.error('Error opening external URL:', error)
      throw new Error(`Failed to open external URL: ${error.message}`)
    }
  })

  // Cleanup all processes on app quit
  ipcMain.on('shell:cleanup', () => {
    activeProcesses.forEach((process, processId) => {
      try {
        process.kill()
      } catch (error) {
        console.error(`Error killing process ${processId}:`, error)
      }
    })
    activeProcesses.clear()
  })
}
