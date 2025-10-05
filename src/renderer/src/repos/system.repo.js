const systemAPI = {
  selectFolder: () => {}
}

const systemDB = {
  selectFolder: () => {
    return window.systemAPI.selectFolder()
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
