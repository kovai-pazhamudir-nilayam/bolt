/**  API implementation  */
const settingsAPI = {
  getCompany: () => {},
  addCompany: () => {},
  deleteCompany: () => {}
}

/**  Local DB implementation  */
const settingsDB = {
  getCompany: () => {
    return window.dbApi.settings.getAll()
  },
  addCompany: (input) => {
    return window.dbApi.settings.add(input)
  },
  deleteCompany: () => {
    return window.dbApi.settings.delete()
  }
}

const settingsFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { settingsRepo: settingsAPI }
  }
  return { settingsRepo: settingsDB }
}

export { settingsFactory }
