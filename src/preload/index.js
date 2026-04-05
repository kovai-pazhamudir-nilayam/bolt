import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { settingsAPI } from './settings.preload'
import { githubSettingsAPI } from './githubSettings.preload'
import { taskAPI } from './task.prelod'
import { systemAPI } from './system.prelod'
import { toolsAPI } from './tools.preload'
import { shellAPI } from './shell.preload'
import { webviewAPI } from './webview.preload'
import { passwordManagerAPI } from './passwordManager.preload'
import { userProfileAPI } from './userProfile.preload'
import { notesAPI } from './notes.preload'
import { featureConfigAPI } from './featureConfig.preload'
import { dbSecretsAPI } from './dbSecrets.preload'
import { savedDbQueryAPI } from './savedDbQuery.preload'
import { apiCollectionAPI } from './apiCollection.preload'
import { dbBackupAPI } from './dbBackup.preload'
import { kanbanTaskAPI } from './kanbanTask.preload'
import { fileAPI } from './file.preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('systemAPI', systemAPI)
    contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)
    contextBridge.exposeInMainWorld('githubSettingsAPI', githubSettingsAPI)
    contextBridge.exposeInMainWorld('taskAPI', taskAPI)
    contextBridge.exposeInMainWorld('toolsAPI', toolsAPI)
    contextBridge.exposeInMainWorld('shellAPI', shellAPI)
    contextBridge.exposeInMainWorld('webviewAPI', webviewAPI)
    contextBridge.exposeInMainWorld('passwordManagerAPI', passwordManagerAPI)
    contextBridge.exposeInMainWorld('userProfileAPI', userProfileAPI)
    contextBridge.exposeInMainWorld('notesAPI', notesAPI)
    contextBridge.exposeInMainWorld('featureConfigAPI', featureConfigAPI)
    contextBridge.exposeInMainWorld('dbSecretsAPI', dbSecretsAPI)
    contextBridge.exposeInMainWorld('savedDbQueryAPI', savedDbQueryAPI)
    contextBridge.exposeInMainWorld('apiCollectionAPI', apiCollectionAPI)
    contextBridge.exposeInMainWorld('dbBackupAPI', dbBackupAPI)
    contextBridge.exposeInMainWorld('kanbanTaskAPI', kanbanTaskAPI)
    contextBridge.exposeInMainWorld('fileAPI', fileAPI)
  } catch (error) {
    console.error('Error exposing APIs:', error)
  }
} else {
  window.electron = electronAPI
  window.systemAPI = systemAPI
  window.settingsAPI = settingsAPI
  window.githubSettingsAPI = githubSettingsAPI
  window.taskAPI = taskAPI
  window.toolsAPI = toolsAPI
  window.shellAPI = shellAPI
  window.webviewAPI = webviewAPI
  window.passwordManagerAPI = passwordManagerAPI
  window.userProfileAPI = userProfileAPI
  window.notesAPI = notesAPI
  window.featureConfigAPI = featureConfigAPI
  window.dbSecretsAPI = dbSecretsAPI
  window.savedDbQueryAPI = savedDbQueryAPI
  window.apiCollectionAPI = apiCollectionAPI
  window.dbBackupAPI = dbBackupAPI
  window.kanbanTaskAPI = kanbanTaskAPI
  window.fileAPI = fileAPI
}
