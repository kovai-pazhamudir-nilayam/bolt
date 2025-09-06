import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  selectFolder: async () => {
    return await ipcRenderer.invoke('select-folder')
  },
  runShellCommandStream: (command, onLog, onEnd) => {
    ipcRenderer.removeAllListeners('shell-command-log')
    ipcRenderer.removeAllListeners('shell-command-end')
    ipcRenderer.on('shell-command-log', (event, log) => {
      onLog && onLog(log)
    })
    ipcRenderer.once('shell-command-end', (event, code) => {
      onEnd && onEnd(code)
    })
    ipcRenderer.send('run-shell-command-stream', command)
  },
  // Configuration database APIs
  config: {
    get: async (brand, environment, configType) => {
      return await ipcRenderer.invoke('config-get', brand, environment, configType)
    },
    save: async (brand, environment, configType, configData) => {
      return await ipcRenderer.invoke('config-save', brand, environment, configType, configData)
    },
    getBrands: async () => {
      return await ipcRenderer.invoke('config-get-brands')
    },
    getEnvironments: async (brand) => {
      return await ipcRenderer.invoke('config-get-environments', brand)
    },
    getAll: async (brand, environment) => {
      return await ipcRenderer.invoke('config-get-all', brand, environment)
    }
  },
  // User management APIs
  users: {
    getAll: async () => {
      return await ipcRenderer.invoke('users-get-all')
    },
    add: async (name, githubHandle) => {
      return await ipcRenderer.invoke('users-add', name, githubHandle)
    },
    update: async (id, name, githubHandle) => {
      return await ipcRenderer.invoke('users-update', id, name, githubHandle)
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('users-delete', id)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
