/**  API implementation  */
const githubConfigsAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

/**  Local DB implementation  */
const githubConfigsDB = {
  getAll: () => {
    return window.githubSettingsApi.githubConfig.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsApi.githubConfig.upsert(input)
  },
  delete: () => {
    return window.githubSettingsApi.githubConfig.delete()
  }
}

const githubSettingsPageFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { githubConfigsRepo: githubConfigsAPI }
  }
  return { githubConfigsRepo: githubConfigsDB }
}

export { githubSettingsPageFactory }
