const apiCollectionAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {},
  run: () => {}
}

const apiCollectionDB = {
  getAll: () => window.apiCollectionAPI.apiCollection.getAll(),
  upsert: (input) => window.apiCollectionAPI.apiCollection.upsert(input),
  delete: (id) => window.apiCollectionAPI.apiCollection.delete(id),
  run: (input) => window.apiCollectionAPI.apiCollection.run(input)
}

const apiCollectionFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { apiCollectionRepo: apiCollectionAPI }
  }
  return { apiCollectionRepo: apiCollectionDB }
}

export { apiCollectionFactory }
