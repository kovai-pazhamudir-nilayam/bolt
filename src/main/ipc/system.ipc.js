/**
 * System-related IPC handlers
 */

import { spawn } from 'child_process'
import { shell, dialog } from 'electron'

export const registerSystemHandlers = (ipcMain) => {
  // Shell command execution
  ipcMain.on('run-shell-command-stream', (event, command) => {
    const child = spawn(command, { shell: true })
    child.stdout.on('data', (data) => {
      event.sender.send('shell-command-log', data.toString())
    })
    child.stderr.on('data', (data) => {
      event.sender.send('shell-command-log', data.toString())
    })
    child.on('close', (code) => {
      event.sender.send('shell-command-end', code)
    })
  })

  // Folder selection dialog
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths.length) return null
    return result.filePaths[0]
  })

  // Test ping handler
  ipcMain.on('ping', () => console.log('pong'))
}
