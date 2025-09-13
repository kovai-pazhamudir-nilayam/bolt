const taskManagerDIAPI = {
  chooseLocation: () => {},
  generateTemplates: () => {},
  getExistingDomainFolders: () => {}
}

const taskManagerDIDB = {
  chooseLocation: () => window.systemAPI.selectFolder(),
  generateCode: ({ targetDir, values }) =>
    window.systemAPI.generateTaskManagerCode({ targetDir, values }),
  getExistingDomainFolders: (targetDir) => window.systemAPI.getExistingDomainFolders(targetDir)
}

const taskManagerDIFactroy = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { taskManagerDIRepo: taskManagerDIAPI }
  }
  return { taskManagerDIRepo: taskManagerDIDB }
}

export { taskManagerDIFactroy }
