import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { settingsAPI } from './settings.preload'
import { githubSettingsAPI } from './githubSettings.preload'
import { taskAPI } from './task.prelod'
import { terminalAPI } from './terminal.prelod'
import { systemAPI } from './system.prelod'
import { toolsAPI } from './tools.preload'
import { shellAPI } from './shell.preload'
import { webviewAPI } from './webview.preload'

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
    console.log('Exposing APIs to renderer process...')
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('systemAPI', systemAPI)
    contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)
    contextBridge.exposeInMainWorld('githubSettingsAPI', githubSettingsAPI)
    contextBridge.exposeInMainWorld('taskAPI', taskAPI)
    contextBridge.exposeInMainWorld('terminalAPI', terminalAPI)
    contextBridge.exposeInMainWorld('toolsAPI', toolsAPI)
    contextBridge.exposeInMainWorld('shellAPI', shellAPI)
    contextBridge.exposeInMainWorld('webviewAPI', webviewAPI)
    console.log('All APIs exposed successfully, including webviewAPI')
    console.log('webviewAPI object:', webviewAPI)
  } catch (error) {
    console.error('Error exposing APIs:', error)
  }
} else {
  console.log('Context isolation disabled, adding APIs to window object...')
  window.electron = electronAPI
  window.systemAPI = systemAPI
  window.settingsAPI = settingsAPI
  window.githubSettingsAPI = githubSettingsAPI
  window.taskAPI = taskAPI
  window.terminalAPI = terminalAPI
  window.toolsAPI = toolsAPI
  window.shellAPI = shellAPI
  window.webviewAPI = webviewAPI
  console.log('All APIs added to window object, including webviewAPI')
  console.log('webviewAPI object:', webviewAPI)
}
