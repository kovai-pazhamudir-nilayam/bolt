const taskAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const taskDB = {
  getAll: () => window.taskApi.getAll(),
  create: (input) => window.taskApi.create(input),
  update: (input) => window.taskApi.update(input),
  delete: (company_code) => window.taskApi.delete(company_code)
}

const tasksFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { taskRepo: taskAPI }
  }
  return { taskRepo: taskDB }
}

export { tasksFactory }
