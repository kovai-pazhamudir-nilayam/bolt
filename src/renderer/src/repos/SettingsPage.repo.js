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

const coreConfigAPI = {}

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

const mediaConfigDB = {
  getAll: () => window.settingsAPI.mediaConfig.getAll(),
  getOne: (input) => window.settingsAPI.mediaConfig.getOne(input),
  upsert: (input) => window.settingsAPI.mediaConfig.upsert(input),
  delete: (input) => window.settingsAPI.mediaConfig.delete(input)
}

const coreConfigDB = {
  getAll: () => window.settingsAPI.coreConfig.getAll(),
  getOne: (input) => window.settingsAPI.coreConfig.getOne(input),
  upsert: (input) => window.settingsAPI.coreConfig.upsert(input),
  delete: (input) => window.settingsAPI.coreConfig.delete(input)
}

const settingsFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return {
      companyRepo: companyAPI,
      environmentRepo: environmentAPI,
      coreConfigRepo: coreConfigAPI
    }
  }
  return {
    companyRepo: companyDB,
    environmentRepo: environmentDB,
    gcpProjectConfigRepo: gcpProjectConfigDB,
    mediaConfigRepo: mediaConfigDB,
    coreConfigRepo: coreConfigDB
  }
}

export { settingsFactory }
