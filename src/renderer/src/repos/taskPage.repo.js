const taskAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const taskDB = {
  getAll: () => window.taskAPI.getAll(),
  create: (input) => window.taskAPI.create(input),
  update: (input) => window.taskAPI.update(input),
  delete: (company_code) => window.taskAPI.delete(company_code)
}

const tasksFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { taskRepo: taskAPI }
  }
  return { taskRepo: taskDB }
}

export { tasksFactory }
