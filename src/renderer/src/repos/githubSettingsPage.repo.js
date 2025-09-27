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

/**  API implementation  */
const githubRepositoriesAPI = {
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

/**  Local DB implementation  */
const githubRepositoriesDB = {
  getAll: () => {
    return window.githubSettingsApi.githubRepo.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsApi.githubRepo.upsert(input)
  },
  delete: (input) => {
    return window.githubSettingsApi.githubRepo.delete(input)
  },
  sync: (company_code) => {
    return window.githubSettingsApi.githubRepo.sync(company_code)
  },
  access: (input) => {
    return window.githubSettingsApi.githubRepo.access(input)
  },
  create: (input) => {
    return window.githubSettingsApi.githubRepo.create(input)
  },
  secret: (input) => {
    return window.githubSettingsApi.githubRepo.secret(input)
  }
}

const githubSecretDB = {
  getAll: () => {
    return window.githubSettingsApi.githubSecret.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsApi.githubSecret.upsert(input)
  },
  delete: () => {
    return window.githubSettingsApi.githubSecret.delete()
  }
}

const githubSettingsPageFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return {
      githubConfigsRepo: githubConfigsAPI,
      githubUsersRepo: githubUsersAPI,
      githubRepositoriesRepo: githubRepositoriesAPI
    }
  }
  return {
    githubConfigsRepo: githubConfigsDB,
    githubUsersRepo: githubUsersDB,
    githubRepositoriesRepo: githubRepositoriesDB,
    githubSecretRepo: githubSecretDB
  }
}

export { githubSettingsPageFactory }
