import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// Import IPC Handler
import { registerSystemHandler } from './ipc/system.ipc.js'
import { registerGithubUserHandler } from './ipc/githubUser.ipc.js'
import { registerCompanyHandler } from './ipc/company.ipc.js'
import { registerEnvironmentHandler } from './ipc/environment.ipc.js'
import { registerCoreTokenConfigHandler } from './ipc/coreTokenConfig.ipc.js'
import { registerGcpProjectConfigHandler } from './ipc/gcpProjectConfig.ipc.js'
import { registerGithubConfigHandler } from './ipc/githubConfig.ipc.js'
import { registerGithubRepoHandler } from './ipc/githubRepo.ipc.js'
import { registerGithubRepoAccessHandler } from './ipc/githubRepoAccess.ipc.js'
import { registerBackupHandler } from './ipc/backup.ipc.js'
import { ConfigDatabase } from './database/ConfigDatabase.js'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    fullscreen: false,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    require('electron').shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Initialize database
let configDb

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize database
  configDb = new ConfigDatabase()
  await configDb.initializeDatabase()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register all IPC Handler
  registerSystemHandler(ipcMain)
  registerGithubUserHandler(ipcMain, configDb)
  registerCompanyHandler(ipcMain, configDb)
  registerEnvironmentHandler(ipcMain, configDb)
  registerCoreTokenConfigHandler(ipcMain, configDb)
  registerGcpProjectConfigHandler(ipcMain, configDb)
  registerGithubConfigHandler(ipcMain, configDb)
  registerGithubRepoHandler(ipcMain, configDb)
  registerBackupHandler(ipcMain, configDb)
  registerGithubRepoAccessHandler(ipcMain, configDb)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Close database when app is quitting
app.on('before-quit', () => {
  if (configDb) {
    configDb.close()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
