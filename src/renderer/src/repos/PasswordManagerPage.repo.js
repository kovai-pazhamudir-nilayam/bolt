const passwordManagerAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const passwordManagerDB = {
  getAll: () => window.passwordManagerAPI.passwordManager.getAll(),
  getById: (id) => window.passwordManagerAPI.passwordManager.getById(id),
  create: (input) => window.settingsAPI.passwordManager.create(input),
  update: (input) => window.passwordManagerAPI.passwordManager.update(input),
  upsert: (input) => window.passwordManagerAPI.passwordManager.upsert(input),
  delete: (id) => window.passwordManagerAPI.passwordManager.delete(id)
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
