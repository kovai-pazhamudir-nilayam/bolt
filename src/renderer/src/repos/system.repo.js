const systemAPI = {
  selectFolder: () => {},
  listFiles: () => {},
  httpRequest: () => {}
}

const systemDB = {
  selectFolder: () => {
    return window.systemAPI.selectFolder()
  },
  listFiles: async (input_path) => {
    return window.systemAPI.listFiles(input_path)
  },
  listDirectories: async (input_path) => {
    return window.systemAPI.listDirectories(input_path)
  },
  httpRequest: async (url, options) => {
    return window.systemAPI.httpRequest(url, options)
  }
}

const systemFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { systemRepo: systemAPI }
  }
  return { systemRepo: systemDB }
}

export { systemFactory }
