import { log } from 'electron-builder'

export const registerPageBuilderHandler = (ipcMain) => {
  async function getExistingPagesTree(_event, folderPath) {
    log.info('Fetching existing pages tree for folderPath:', folderPath)
  }

  ipcMain.handle('pageBuilder:getExistingPagesTree', getExistingPagesTree)
}
