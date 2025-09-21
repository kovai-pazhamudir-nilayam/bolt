import { registerGithubConfigHandler } from './githubConfig.ipc'
import { registerGithubUserHandler } from './githubUser.ipc'

export const registerSettingsHandler = (ipcMain, configDb) => {
  registerGithubConfigHandler(ipcMain, configDb)
  registerGithubUserHandler(ipcMain, configDb)
}
