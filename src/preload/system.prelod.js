import { ipcRenderer } from 'electron'

const systemApi = {
  selectFolder: async () => {
    return ipcRenderer.invoke('system:select-folder')
  }
}
export { systemApi }
