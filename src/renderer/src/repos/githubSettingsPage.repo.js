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
    return window.githubSettingsAPI.githubConfig.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsAPI.githubConfig.upsert(input)
  },
  delete: () => {
    return window.githubSettingsAPI.githubConfig.delete()
  }
}

const githubUsersDB = {
  getAll: () => {
    return window.githubSettingsAPI.githubUser.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsAPI.githubUser.upsert(input)
  },
  delete: (github_handle) => {
    return window.githubSettingsAPI.githubUser.delete(github_handle)
  }
}

/**  Local DB implementation  */
const githubRepositoriesDB = {
  getAll: () => {
    return window.githubSettingsAPI.githubRepo.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsAPI.githubRepo.upsert(input)
  },
  delete: (input) => {
    return window.githubSettingsAPI.githubRepo.delete(input)
  },
  sync: (company_code) => {
    return window.githubSettingsAPI.githubRepo.sync(company_code)
  },
  access: (input) => {
    return window.githubSettingsAPI.githubRepo.access(input)
  },
  create: (input) => {
    return window.githubSettingsAPI.githubRepo.create(input)
  },
  secret: (input) => {
    return window.githubSettingsAPI.githubRepo.secret(input)
  }
}

const githubSecretDB = {
  getAll: () => {
    return window.githubSettingsAPI.githubSecret.getAll()
  },
  upsert: (input) => {
    return window.githubSettingsAPI.githubSecret.upsert(input)
  },
  delete: () => {
    return window.githubSettingsAPI.githubSecret.delete()
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
