const shellAPI = {
  run: () => {},
  onLog: () => {},
  onEnd: () => {}
}

const shellDB = {
  run: (command, options = {}) => {
    return window.shellAPI.run(command, options)
  },
  onLog: (callback) => {
    return window.shellAPI.onLog(callback)
  },
  onEnd: (callback) => {
    return window.shellAPI.onEnd(callback)
  },
  kill: (processId) => {
    return window.shellAPI.kill(processId)
  },
  getActiveProcesses: () => {
    return window.shellAPI.getActiveProcesses()
  }
}

const shellFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { shellRepo: shellAPI }
  }
  return { shellRepo: shellDB }
}

export { shellFactory }
