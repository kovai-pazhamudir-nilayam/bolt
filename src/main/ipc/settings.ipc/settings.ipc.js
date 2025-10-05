import { registerCompanyHandler } from './company.ipc'
import { registeCoreConfigHandler } from './core-config.ipc'
import { registerEnvironmentHandler } from './environment.ipc'
import { registeGCPProjectConfigHandler } from './gcp-project-config.ipc'

export const registerSettingsHandler = (ipcMain, configDb) => {
  registerCompanyHandler(ipcMain, configDb)
  registerEnvironmentHandler(ipcMain, configDb)
  registeCoreConfigHandler(ipcMain, configDb)
  registeGCPProjectConfigHandler(ipcMain, configDb)
}
