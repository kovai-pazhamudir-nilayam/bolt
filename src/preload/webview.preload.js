import { ipcRenderer } from 'electron'

console.log('Webview preload script loaded')
console.log('ipcRenderer available:', !!ipcRenderer)
console.log('ipcRenderer.invoke available:', !!ipcRenderer?.invoke)

const webviewAPI = {
  // Open URL in new window within the app
  open: async (url, options = {}) => {
    console.log('Webview preload: calling webview:open with:', { url, options })
    try {
      const result = await ipcRenderer.invoke('webview:open', url, options)
      console.log('Webview preload: webview:open result:', result)
      return result
    } catch (error) {
      console.error('Webview preload: webview:open error:', error)
      throw error
    }
  },

  // Navigate main window to URL
  navigate: (url) => {
    console.log('Webview preload: calling webview:navigate with:', { url })
    return ipcRenderer.invoke('webview:navigate', url)
  },

  // Setup iframe embedding for main window
  embed: async (url) => {
    console.log('Webview preload: calling webview:embed with:', { url })
    try {
      const result = await ipcRenderer.invoke('webview:embed', url)
      console.log('Webview preload: webview:embed result:', result)
      return result
    } catch (error) {
      console.error('Webview preload: webview:embed error:', error)
      throw error
    }
  }
}

export { webviewAPI }
