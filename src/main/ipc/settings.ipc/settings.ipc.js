import { registerCompanyHandler } from './company.ipc'
import { registeCoreConfigHandler } from './core-config.ipc'
import { registerEnvironmentHandler } from './environment.ipc'

export const registerSettingsHandler = (ipcMain, configDb) => {
  registerCompanyHandler(ipcMain, configDb)
  registerEnvironmentHandler(ipcMain, configDb)
  registeCoreConfigHandler(ipcMain, configDb)
}
