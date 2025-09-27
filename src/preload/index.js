import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { settingsApi } from './settings.preload'
import { githubSettingsApi } from './githubSettings.preload'
import { taskApi } from './task.prelod'
import { terminalApi } from './terminal.prelod'
import { systemApi } from './system.prelod'
import { toolsAPI } from './tools.preload'

// const system2345 = {
//   onTaskManagerLog: (callback) => {
//     ipcRenderer.on('taskManagerDI:log', (event, log) => {
//       callback(log)
//     })
//   },

//   generateTaskManagerCode: async ({ targetDir, values }) => {
//     return ipcRenderer.invoke('generate:taskManagerDICode', { targetDir, values })
//   },
//   getExistingDomainFolders: async (targetDir) => {
//     return ipcRenderer.invoke('folder:getExistingDomainFolders', targetDir)
//   }
// }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('systemApi', systemApi)
    contextBridge.exposeInMainWorld('settingsApi', settingsApi)
    contextBridge.exposeInMainWorld('githubSettingsApi', githubSettingsApi)
    contextBridge.exposeInMainWorld('taskApi', taskApi)
    contextBridge.exposeInMainWorld('terminalAPI', terminalApi)
    contextBridge.exposeInMainWorld('toolsAPI', toolsAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.systemApi = systemApi
  window.settingsApi = settingsApi
  window.githubSettingsApi = githubSettingsApi
  window.taskApi = taskApi
  window.terminalAPI = terminalApi
  window.toolsAPI = toolsAPI
}
