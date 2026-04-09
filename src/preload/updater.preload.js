import { ipcRenderer } from 'electron'

export const updaterAPI = {
  check: () => ipcRenderer.invoke('updater:check'),
  getVersion: () => ipcRenderer.invoke('updater:getVersion'),

  onAvailable: (cb) => ipcRenderer.on('updater:available', (_e, info) => cb(info)),

  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('updater:available')
  }
}
