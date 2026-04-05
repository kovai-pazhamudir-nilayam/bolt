import { ipcRenderer } from 'electron'

export const fileAPI = {
  readFile: (filePath) => ipcRenderer.invoke('file:readFile', filePath)
}
