const terminalAPI = {
  run: () => {},
  onLog: () => {},
  onEnd: () => {}
}

const terminalDB = {
  run: () => window.terminalAPI.run(),
  onLog: (input) => window.terminalAPI.onLog(input),
  onEnd: (input) => window.terminalAPI.onEnd(input)
}

const terminalFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { taskRepo: terminalAPI }
  }
  return { taskRepo: terminalDB }
}

export { terminalFactory }
