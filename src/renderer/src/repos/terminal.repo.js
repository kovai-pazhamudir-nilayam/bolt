const terminalAPI = {
  run: () => {},
  onLog: () => {},
  onEnd: () => {}
}

const terminalDB = {
  run: (command, options = {}) => {
    if (!window.shellAPI) {
      console.error('shellAPI is not available. Make sure the preload script is loaded correctly.')
      throw new Error('Shell API not available')
    }
    return window.shellAPI.run(command, options)
  },
  onLog: (callback) => {
    if (!window.shellAPI) {
      console.error('shellAPI is not available. Make sure the preload script is loaded correctly.')
      return () => {}
    }
    return window.shellAPI.onLog(callback)
  },
  onEnd: (callback) => {
    if (!window.shellAPI) {
      console.error('shellAPI is not available. Make sure the preload script is loaded correctly.')
      return () => {}
    }
    return window.shellAPI.onEnd(callback)
  },
  kill: (processId) => {
    if (!window.shellAPI) {
      console.error('shellAPI is not available. Make sure the preload script is loaded correctly.')
      return Promise.reject(new Error('Shell API not available'))
    }
    return window.shellAPI.kill(processId)
  },
  getActiveProcesses: () => {
    if (!window.shellAPI) {
      console.error('shellAPI is not available. Make sure the preload script is loaded correctly.')
      return Promise.reject(new Error('Shell API not available'))
    }
    return window.shellAPI.getActiveProcesses()
  }
}

const terminalFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { terminalRepo: terminalAPI }
  }
  return { terminalRepo: terminalDB }
}

export { terminalFactory }
