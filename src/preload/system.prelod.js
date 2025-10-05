import { ipcRenderer } from 'electron'

const systemAPI = {
  selectFolder: async () => {
    return ipcRenderer.invoke('system:select-folder')
  }
}
export { systemAPI }
