const taskManagerDIAPI = {
  chooseLocation: () => {},
  generateTemplates: () => {}
}

const taskManagerDIDB = {
  chooseLocation: () => window.systemAPI.selectFolder(),
  generateCode: ({ targetDir, values }) =>
    window.systemAPI.generateTaskManagerCode({ targetDir, values })
}

const taskManagerDIFactroy = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { companyRepo: taskManagerDIAPI }
  }
  return { companyRepo: taskManagerDIDB }
}

export { taskManagerDIFactroy }
