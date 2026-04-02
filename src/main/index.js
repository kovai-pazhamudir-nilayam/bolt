import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'

// Import IPC Handler
import { ConfigDatabase } from './database/ConfigDatabase.js'
import { registerSystemHandler } from './ipc/system.ipc.js'
import { registerSettingsHandler } from './ipc/settings.ipc/settings.ipc.js'
import { registerGithubSettingsHandler } from './ipc/githubSettings.ipc/githubSettings.ipc'
import { registerPasswordManagerHandler } from './ipc/passwordManager.ipc'
import { registerTaskHandler } from './ipc/task.ipc'
import { registerToolsHandler } from './ipc/tools.ipc/tools.ipc'
import { registerShellHandler } from './ipc/shell.ipc'
import { registerWebviewHandler } from './ipc/webview.ipc'
import { registerUserProfileHandler } from './ipc/userProfile.ipc'
import { registerNotesHandler } from './ipc/notes.ipc'
import { registerFeatureConfigHandler } from './ipc/featureConfig.ipc'
import { registerDBSecretsHandler } from './ipc/dbSecrets.ipc'
import { registerSavedDbQueryHandler } from './ipc/savedDbQuery.ipc'

function createWindow() {
  // Get the primary display dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: false,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true // Enable devTools for both dev and prod for now, can be gated behind env variable if needed
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Renderer] did-finish-load:', mainWindow.webContents.getURL())
  })

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[Renderer] did-fail-load:', errorCode, errorDescription, validatedURL)
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
    const htmlPath = join(__dirname, '../renderer/index.html')
    console.log('[Main] loading file:', htmlPath)
    mainWindow.loadFile(htmlPath)
  }
}

// Initialize database
let configDb

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
process.on('uncaughtException', (err) => {
  console.error('[Main] uncaughtException:', err)
})

process.on('unhandledRejection', (reason) => {
  console.error('[Main] unhandledRejection:', reason)
})

app.whenReady().then(async () => {
  console.log('[Main] app ready')
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.bolt')

  // Initialize database
  configDb = new ConfigDatabase()
  await configDb.initializeDatabase()
  console.log('[Main] DB ready, registering IPC handlers')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register all IPC Handler
  registerGithubSettingsHandler(ipcMain, configDb)
  registerPasswordManagerHandler(ipcMain, configDb)
  registerSettingsHandler(ipcMain, configDb)
  registerTaskHandler(ipcMain, configDb)
  registerSystemHandler(ipcMain)
  registerToolsHandler(ipcMain)
  registerShellHandler(ipcMain)
  registerWebviewHandler(ipcMain)
  registerUserProfileHandler(ipcMain, configDb)
  registerNotesHandler(ipcMain, configDb)
  registerFeatureConfigHandler(ipcMain, configDb)
  registerDBSecretsHandler(ipcMain, configDb)
  registerSavedDbQueryHandler(ipcMain, configDb)
  console.log('[Main] IPC handlers registered, creating window')

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
