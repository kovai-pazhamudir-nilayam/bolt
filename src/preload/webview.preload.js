import { ipcRenderer } from 'electron'

const webviewAPI = {
  // Open URL in new window within the app
  open: async (url, options = {}) => {
    try {
      return await ipcRenderer.invoke('webview:open', url, options)
    } catch (error) {
      console.error('Webview open error:', error)
      throw error
    }
  },

  // Setup iframe embedding for main window
  embed: async (url) => {
    try {
      return await ipcRenderer.invoke('webview:embed', url)
    } catch (error) {
      console.error('Webview embed error:', error)
      throw error
    }
  }
}

export { webviewAPI }
