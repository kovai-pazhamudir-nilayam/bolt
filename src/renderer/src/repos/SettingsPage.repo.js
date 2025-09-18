const companyAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const companyDB = {
  getAll: () => window.settingsApi.company.getAll(),
  upsert: (input) => window.settingsApi.company.upsert(input),
  delete: (company_code) => window.settingsApi.company.delete(company_code)
}

const environmentAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const environmentDB = {
  getAll: () => window.settingsApi.environment.getAll(),
  upsert: (input) => window.settingsApi.environment.upsert(input),
  delete: (env_code) => window.settingsApi.environment.delete(env_code)
}

const settingsFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { companyRepo: companyAPI, environmentRepo: environmentAPI }
  }
  return { companyRepo: companyDB, environmentRepo: environmentDB }
}

export { settingsFactory }
