import { autoUpdater } from 'electron-updater'

export const checkForUpdates = () => autoUpdater.checkForUpdates()

export const registerUpdaterHandler = (ipcMain, mainWindow) => {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  const send = (channel, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data)
    }
  }

  autoUpdater.on('checking-for-update', () => {
    send('updater:checking')
  })

  autoUpdater.on('update-available', (info) => {
    send('updater:available', info)
  })

  autoUpdater.on('update-not-available', () => {
    send('updater:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    send('updater:progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    send('updater:downloaded', info)
  })

  autoUpdater.on('error', (err) => {
    send('updater:error', err.message)
  })

  ipcMain.handle('updater:check', () => {
    autoUpdater.checkForUpdates()
  })

  ipcMain.handle('updater:download', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall()
  })
}
