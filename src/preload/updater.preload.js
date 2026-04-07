import { ipcRenderer } from 'electron'

export const updaterAPI = {
  check: () => ipcRenderer.invoke('updater:check'),
  download: () => ipcRenderer.invoke('updater:download'),
  install: () => ipcRenderer.invoke('updater:install'),

  onChecking: (cb) => ipcRenderer.on('updater:checking', cb),
  onAvailable: (cb) => ipcRenderer.on('updater:available', (_e, info) => cb(info)),
  onNotAvailable: (cb) => ipcRenderer.on('updater:not-available', cb),
  onProgress: (cb) => ipcRenderer.on('updater:progress', (_e, progress) => cb(progress)),
  onDownloaded: (cb) => ipcRenderer.on('updater:downloaded', (_e, info) => cb(info)),
  onError: (cb) => ipcRenderer.on('updater:error', (_e, msg) => cb(msg)),

  removeAllListeners: () => {
    ;[
      'updater:checking',
      'updater:available',
      'updater:not-available',
      'updater:progress',
      'updater:downloaded',
      'updater:error'
    ].forEach((ch) => ipcRenderer.removeAllListeners(ch))
  }
}
