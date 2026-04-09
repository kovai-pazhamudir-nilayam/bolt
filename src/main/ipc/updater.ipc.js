import { app } from 'electron'
import { autoUpdater } from 'electron-updater'

export const checkForUpdates = () => autoUpdater.checkForUpdates()

export const registerUpdaterHandler = (ipcMain, mainWindow) => {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  const send = (channel, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data)
    }
  }

  autoUpdater.on('update-available', (info) => {
    send('updater:available', info)
  })

  autoUpdater.on('error', (err) => {
    console.warn('[Updater] error (ignored):', err.message)
  })

  ipcMain.handle('updater:check', () => {
    autoUpdater.checkForUpdates()
  })

  ipcMain.handle('updater:getVersion', () => {
    return app.getVersion()
  })
}
