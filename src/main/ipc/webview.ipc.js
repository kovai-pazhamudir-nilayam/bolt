import { BrowserWindow, session } from 'electron'

// Global flag to track if header filtering is already set up
let headerFilteringSetup = false

export const registerWebviewHandler = (ipcMain) => {
  // Handle opening URL in new window
  ipcMain.handle('webview:open', async (event, url, options = {}) => {
    const { width = 1200, height = 800, title = 'Web View' } = options

    try {
      // Set up header filtering only once
      if (!headerFilteringSetup) {
        const urlObj = new URL(url)
        const filter = { urls: [`${urlObj.origin}/*`] }

        session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
          const headers = details.responseHeaders || {}
          // Remove restrictive headers
          delete headers['content-security-policy']
          delete headers['content-security-policy-report-only']
          delete headers['Content-Security-Policy']
          delete headers['Content-Security-Policy-Report-Only']
          delete headers['x-frame-options']
          delete headers['X-Frame-Options']
          callback({ responseHeaders: headers })
        })

        headerFilteringSetup = true
      }

      // Create new browser window
      const webviewWindow = new BrowserWindow({
        width,
        height,
        title,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: false,
          allowRunningInsecureContent: true,
          partition: 'persist:webview-session'
        }
      })

      // Load URL directly
      await webviewWindow.loadURL(url)

      // Show window when ready
      webviewWindow.once('ready-to-show', () => {
        webviewWindow.show()
      })

      // Handle external links
      webviewWindow.webContents.setWindowOpenHandler((details) => {
        require('electron').shell.openExternal(details.url)
        return { action: 'deny' }
      })

      return { success: true, windowId: webviewWindow.id }
    } catch (error) {
      console.error('Error opening webview:', error)
      throw new Error(`Failed to open webview: ${error.message}`)
    }
  })

  // Handle embedding setup for main window
  ipcMain.handle('webview:embed', async (event, url) => {
    try {
      // Configure session for better cookie handling
      const webviewSession = session.fromPartition('persist:webview-session')
      webviewSession.cookies.flushStore()

      // Set user agent
      webviewSession.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Allow all permissions
      webviewSession.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(true)
      })

      return { success: true, url }
    } catch (error) {
      console.error('Error setting up webview embedding:', error)
      throw new Error(`Failed to setup webview embedding: ${error.message}`)
    }
  })
}
