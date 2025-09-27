const systemApi = {
  selectFolder: () => {}
}

const systemDB = {
  selectFolder: () => {
    return window.systemApi.selectFolder()
  }
}

const systemFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { systemRepo: systemApi }
  }
  return { systemRepo: systemDB }
}

export { systemFactory }
