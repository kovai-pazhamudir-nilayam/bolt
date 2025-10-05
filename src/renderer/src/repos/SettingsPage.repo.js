const companyAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const companyDB = {
  getAll: () => window.settingsAPI.company.getAll(),
  upsert: (input) => window.settingsAPI.company.upsert(input),
  delete: (company_code) => window.settingsAPI.company.delete(company_code)
}

const environmentAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const environmentDB = {
  getAll: () => window.settingsAPI.environment.getAll(),
  upsert: (input) => window.settingsAPI.environment.upsert(input),
  delete: (env_code) => window.settingsAPI.environment.delete(env_code)
}

const gcpProjectConfigDB = {
  getAll: () => window.settingsAPI.gcpProjectConfig.getAll(),
  getOne: (input) => window.settingsAPI.gcpProjectConfig.getOne(input),
  upsert: (input) => window.settingsAPI.gcpProjectConfig.upsert(input),
  delete: (input) => window.settingsAPI.gcpProjectConfig.delete(input)
}

const passwordManagerDB = {
  getAll: () => window.settingsAPI.passwordManager.getAll(),
  getById: (id) => window.settingsAPI.passwordManager.getById(id),
  create: (input) => window.settingsAPI.passwordManager.create(input),
  update: (input) => window.settingsAPI.passwordManager.update(input),
  delete: (id) => window.settingsAPI.passwordManager.delete(id)
}

const settingsFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { companyRepo: companyAPI, environmentRepo: environmentAPI }
  }
  return {
    companyRepo: companyDB,
    environmentRepo: environmentDB,
    gcpProjectConfigRepo: gcpProjectConfigDB,
    passwordManagerRepo: passwordManagerDB
  }
}

export { settingsFactory }
