import { spawn } from 'child_process'

ipcMain.on('run-shell-command-stream', (event, command) => {
  const child = spawn(command, { shell: true })
  child.stdout.on('data', (data) => {
    event.sender.send('shell-command-log', data.toString())
  })
  child.stderr.on('data', (data) => {
    event.sender.send('shell-command-log', data.toString())
  })
  child.on('close', (code) => {
    event.sender.send('shell-command-end', code)
  })
})
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ConfigDatabase } from './database.js'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    fullscreen: true,
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
    shell.openExternal(details.url)
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
let configDb;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize database
  configDb = new ConfigDatabase()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handler for folder selection
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths.length) return null
    return result.filePaths[0]
  })

  // IPC handlers for configuration database
  ipcMain.handle('config-get', (event, brand, environment, configType) => {
    try {
      return configDb.getConfig(brand, environment, configType)
    } catch (error) {
      console.error('Error getting config:', error)
      return null
    }
  })

  ipcMain.handle('config-save', (event, brand, environment, configType, configData) => {
    try {
      return configDb.saveConfig(brand, environment, configType, configData)
    } catch (error) {
      console.error('Error saving config:', error)
      throw error
    }
  })

  ipcMain.handle('config-get-brands', () => {
    try {
      return configDb.getBrands()
    } catch (error) {
      console.error('Error getting brands:', error)
      return []
    }
  })

  ipcMain.handle('config-get-environments', (event, brand) => {
    try {
      return configDb.getEnvironments(brand)
    } catch (error) {
      console.error('Error getting environments:', error)
      return []
    }
  })

  ipcMain.handle('config-get-all', (event, brand, environment) => {
    try {
      return configDb.getConfig(brand, environment)
    } catch (error) {
      console.error('Error getting all configs:', error)
      return {}
    }
  })

  // IPC handlers for user management
  ipcMain.handle('users-get-all', () => {
    try {
      return configDb.getUsers()
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  })

  ipcMain.handle('users-add', (event, name, githubHandle) => {
    try {
      return configDb.addUser(name, githubHandle)
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  })

  ipcMain.handle('users-update', (event, id, name, githubHandle) => {
    try {
      const stmt = configDb.db.prepare(`
        UPDATE users SET name = ?, github_handle = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      return stmt.run(name, githubHandle, id)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  })

  ipcMain.handle('users-delete', (event, id) => {
    try {
      const stmt = configDb.db.prepare('DELETE FROM users WHERE id = ?')
      return stmt.run(id)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

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
