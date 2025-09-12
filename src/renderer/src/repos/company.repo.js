const companyAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const companyDB = {
  getAll: () => window.dbApi.company.getAll(),
  upsert: (input) => window.dbApi.company.upsert(input),
  delete: (company_code) => window.dbApi.company.delete(company_code)
}

const companyFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { companyRepo: companyAPI }
  }
  return { companyRepo: companyDB }
}

export { companyFactory }
