const dbSecretsAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const dbSecretsDB = {
  getAll: () => window.dbSecretsAPI.dbSecrets.getAll(),
  getById: (id) => window.dbSecretsAPI.dbSecrets.getById(id),
  upsert: (input) => window.dbSecretsAPI.dbSecrets.upsert(input),
  delete: (id) => window.dbSecretsAPI.dbSecrets.delete(id)
}

const dbSecretsFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { dbSecretsRepo: dbSecretsAPI }
  }
  return {
    dbSecretsRepo: dbSecretsDB
  }
}

export { dbSecretsFactory }
