import { registerGithubConfigHandler } from './githubConfig.ipc'
import { registerGithubUserHandler } from './githubUser.ipc'

export const registerGithubSettingsHandler = (ipcMain, configDb) => {
  registerGithubConfigHandler(ipcMain, configDb)
  registerGithubUserHandler(ipcMain, configDb)
}
