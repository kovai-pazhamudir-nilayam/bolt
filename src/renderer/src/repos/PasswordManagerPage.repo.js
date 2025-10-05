const passwordManagerAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const passwordManagerDB = {
  getAll: () => window.settingsAPI.passwordManager.getAll(),
  getById: (id) => window.settingsAPI.passwordManager.getById(id),
  create: (input) => window.settingsAPI.passwordManager.create(input),
  update: (input) => window.settingsAPI.passwordManager.update(input),
  upsert: (input) => window.settingsAPI.passwordManager.upsert(input),
  delete: (id) => window.settingsAPI.passwordManager.delete(id)
}

const passwordManagerFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { passwordManagerRepo: passwordManagerAPI }
  }
  return {
    passwordManagerRepo: passwordManagerDB
  }
}

export { passwordManagerFactory }
