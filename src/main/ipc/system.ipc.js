import { dialog } from 'electron'

export const registerSystemHandler = (ipcMain) => {
  async function selectFolder() {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths.length) return null
    return result.filePaths[0]
  }

  ipcMain.handle('system:select-folder', selectFolder)
}
