/**
 * System-related IPC Handler
 */

import { dialog } from 'electron'

export const registerTaskManagerDIHandler = (ipcMain) => {
  // Folder selection dialog
  ipcMain.handle('generate:taskManagerDICode', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths.length) return null
    return result.filePaths[0]
  })

  // Test ping handler
  ipcMain.on('ping', () => console.log('pong'))
}
