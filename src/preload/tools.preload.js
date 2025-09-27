import { ipcRenderer } from 'electron'

const pageBuilder = {
  getExistingPagesTree: (folderPath) =>
    ipcRenderer.invoke('pageBuilder:getExistingPagesTree', folderPath)
}

const toolsAPI = {
  pageBuilder
}

export { toolsAPI }
