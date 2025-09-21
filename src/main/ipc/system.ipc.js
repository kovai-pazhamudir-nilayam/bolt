/**
 * System-related IPC Handler
 */

import { spawn } from 'child_process'
import { dialog } from 'electron'

export const registerSystemHandler = (ipcMain) => {
  // Shell command execution
  ipcMain.on('terminal:run', (event, command) => {
    const child = spawn(command, { shell: true })
    child.stdout.on('data', (data) => {
      event.sender.send('terminal:log', data.toString())
    })
    child.stderr.on('data', (data) => {
      event.sender.send('terminal:log', data.toString())
    })
    child.on('close', (code) => {
      event.sender.send('terminal:end', code)
    })
  })

  // Folder selection dialog
  ipcMain.handle('system:select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths.length) return null
    return result.filePaths[0]
  })

  // Test ping handler
  ipcMain.on('ping', () => console.log('pong'))
}
