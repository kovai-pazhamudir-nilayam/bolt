// import { ipcRenderer } from 'electron'

const taskManagerDIAPI = {
  chooseLocation: () => {},
  generateTemplates: () => {},
  getExistingDomainFolders: () => {}
}

const taskManagerDIDB = {
  chooseLocation: () => window.systemAPI.selectFolder(),
  generateCode: ({ targetDir, values, onLog }) => {
    // ✅ subscribe to logs
    if (onLog) {
      window.systemAPI.onTaskManagerLog((log) => {
        onLog(log) // forward logs to LogViewer
      })
    }
    return window.systemAPI.generateTaskManagerCode({ targetDir, values })
  },
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
