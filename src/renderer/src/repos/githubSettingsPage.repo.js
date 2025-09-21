/**  API implementation  */
const githubConfigsAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const githubUsersAPI = {
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

const githubUsersDB = {
  getAll: () => {
    return window.githubSettingsApi.githubUser.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsApi.githubUser.upsert(input)
  },
  delete: () => {
    return window.githubSettingsApi.githubUser.delete()
  }
}

const githubSettingsPageFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { githubConfigsRepo: githubConfigsAPI, githubUsersRepo: githubUsersAPI }
  }
  return { githubConfigsRepo: githubConfigsDB, githubUsersRepo: githubUsersDB }
}

export { githubSettingsPageFactory }
