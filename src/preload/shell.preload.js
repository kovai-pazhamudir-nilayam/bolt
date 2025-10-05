import { ipcRenderer } from 'electron'

console.log('Shell preload script loaded')

const shellAPI = {
  // Run a shell command
  run: (command, options = {}) => ipcRenderer.invoke('shell:run', command, options),

  // Kill a specific process
  kill: (processId) => ipcRenderer.invoke('shell:kill', processId),

  // Get active processes
  getActiveProcesses: () => ipcRenderer.invoke('shell:active-processes'),

  // Open external URL in default browser
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Listen for log events
  onLog: (callback) => {
    const handler = (event, data) => callback(data)
    ipcRenderer.on('shell:log', handler)

    // Return unsubscribe function
    return () => ipcRenderer.removeListener('shell:log', handler)
  },

  // Listen for process end events
  onEnd: (callback) => {
    const handler = (event, data) => callback(data)
    ipcRenderer.on('shell:end', handler)

    // Return unsubscribe function
    return () => ipcRenderer.removeListener('shell:end', handler)
  },

  // Cleanup all listeners
  cleanup: () => {
    ipcRenderer.removeAllListeners('shell:log')
    ipcRenderer.removeAllListeners('shell:end')
  }
}

export { shellAPI }
