import { BrowserWindow, session } from 'electron'

export const registerWebviewHandler = (ipcMain) => {
  // Handle opening URL in iframe within the app
  ipcMain.handle('webview:open', async (event, url, options = {}) => {
    console.log('Webview handler called with:', { url, options })
    const { width = 1200, height = 800, title = 'Web View' } = options

    try {
      // Set up header filtering to allow iframe embedding
      const urlObj = new URL(url)
      const filter = { urls: [`${urlObj.origin}/*`] }

      // Remove CSP and X-Frame-Options headers to allow iframe embedding
      session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
        const headers = details.responseHeaders || {}

        // Remove CSP headers
        delete headers['content-security-policy']
        delete headers['content-security-policy-report-only']
        delete headers['Content-Security-Policy']
        delete headers['Content-Security-Policy-Report-Only']

        // Remove X-Frame-Options headers
        delete headers['x-frame-options']
        delete headers['X-Frame-Options']

        callback({ responseHeaders: headers })
      })

      // Create a new browser window with iframe-friendly settings
      const webviewWindow = new BrowserWindow({
        width,
        height,
        title,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: false, // Disable web security to allow iframe embedding
          allowRunningInsecureContent: true,
          partition: 'persist:webview-session' // Use persistent session for cookies
        }
      })

      // Create HTML content with iframe
      const iframeHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            iframe {
              width: 100%;
              height: 100vh;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe 
            src="${url}" 
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads allow-modals"
            allow="camera; microphone; geolocation; payment; usb; autoplay; encrypted-media; fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </body>
        </html>
      `

      // Load the iframe HTML
      console.log('Loading iframe HTML with URL:', url)
      await webviewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(iframeHtml)}`)
      console.log('Iframe loaded successfully')

      // Show the window when ready
      webviewWindow.once('ready-to-show', () => {
        console.log('Webview window ready to show, displaying window')
        webviewWindow.show()
      })

      // Handle window closed
      webviewWindow.on('closed', () => {
        // Clean up the header filter when window is closed
        session.defaultSession.webRequest.removeListener('onHeadersReceived')
      })

      // Handle new window requests (open in external browser)
      webviewWindow.webContents.setWindowOpenHandler((details) => {
        require('electron').shell.openExternal(details.url)
        return { action: 'deny' }
      })

      console.log('Webview window created successfully:', webviewWindow.id)
      return { success: true, windowId: webviewWindow.id }
    } catch (error) {
      console.error('Error opening webview:', error)
      throw new Error(`Failed to open webview: ${error.message}`)
    }
  })

  // Handle opening URL in main window (navigate current window)
  ipcMain.handle('webview:navigate', async (event, url) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender)
      if (mainWindow) {
        await mainWindow.loadURL(url)
        return { success: true }
      } else {
        throw new Error('Main window not found')
      }
    } catch (error) {
      console.error('Error navigating to URL:', error)
      throw new Error(`Failed to navigate to URL: ${error.message}`)
    }
  })

  // Handle embedding iframe in main window
  ipcMain.handle('webview:embed', async (event, url) => {
    console.log('Webview embed handler called with:', { url })

    try {
      // Set up header filtering to allow iframe embedding
      const urlObj = new URL(url)
      const filter = { urls: [`${urlObj.origin}/*`] }

      // Remove CSP and X-Frame-Options headers to allow iframe embedding
      session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
        const headers = details.responseHeaders || {}

        // Remove CSP headers
        delete headers['content-security-policy']
        delete headers['content-security-policy-report-only']
        delete headers['Content-Security-Policy']
        delete headers['Content-Security-Policy-Report-Only']

        // Remove X-Frame-Options headers
        delete headers['x-frame-options']
        delete headers['X-Frame-Options']

        callback({ responseHeaders: headers })
      })

      // Configure session for better cookie handling
      const webviewSession = session.fromPartition('persist:webview-session')

      // Enable cookies and local storage
      webviewSession.cookies.flushStore()

      // Set user agent to match a real browser
      webviewSession.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Configure additional session settings for better compatibility
      webviewSession.setPermissionRequestHandler((webContents, permission, callback) => {
        // Allow all permissions for the webview
        callback(true)
      })

      // Set up additional webRequest handlers for better session management
      webviewSession.webRequest.onBeforeSendHeaders((details, callback) => {
        // Add additional headers that might be needed for session management
        details.requestHeaders['Accept'] =
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        details.requestHeaders['Accept-Language'] = 'en-US,en;q=0.5'
        details.requestHeaders['Accept-Encoding'] = 'gzip, deflate, br'
        details.requestHeaders['DNT'] = '1'
        details.requestHeaders['Connection'] = 'keep-alive'
        details.requestHeaders['Upgrade-Insecure-Requests'] = '1'
        callback({ requestHeaders: details.requestHeaders })
      })

      return { success: true, url }
    } catch (error) {
      console.error('Error setting up iframe embedding:', error)
      throw new Error(`Failed to setup iframe embedding: ${error.message}`)
    }
  })
}
