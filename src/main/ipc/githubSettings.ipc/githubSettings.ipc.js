import { registerGithubConfigHandler } from './githubConfig.ipc'
import { registerGithubUserHandler } from './githubUser.ipc'
import { registerGithubRepoHandler } from './githubRepo.ipc'

export const registerGithubSettingsHandler = (ipcMain, configDb) => {
  registerGithubConfigHandler(ipcMain, configDb)
  registerGithubUserHandler(ipcMain, configDb)
  registerGithubRepoHandler(ipcMain, configDb)
}
