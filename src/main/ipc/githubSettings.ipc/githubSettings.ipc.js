import { registerGithubConfigHandler } from './githubConfig.ipc'

export const registerSettingsHandler = (ipcMain, configDb) => {
  registerGithubConfigHandler(ipcMain, configDb)
}
