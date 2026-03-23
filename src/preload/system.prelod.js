import { ipcRenderer } from 'electron'

const systemAPI = {
  selectFolder: async () => {
    return ipcRenderer.invoke('system:select-folder')
  },
  listFiles: async (input_path) => {
    return ipcRenderer.invoke('system:list-files', input_path)
  },
  listDirectories: async (input_path) => {
    return ipcRenderer.invoke('system:list-directories', input_path)
  },
  httpRequest: async (url, options) => {
    return ipcRenderer.invoke('system:http-request', url, options)
  },
  selectFile: async () => {
    return ipcRenderer.invoke('system:select-file')
  },
  saveFileDialog: async (defaultName) => {
    return ipcRenderer.invoke('system:save-file-dialog', defaultName)
  }
}
export { systemAPI }
