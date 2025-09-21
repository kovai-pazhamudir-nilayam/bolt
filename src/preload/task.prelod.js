import { ipcRenderer } from 'electron'

const taskApi = {
  getAll: () => ipcRenderer.invoke('task:list'),
  create: (input) => ipcRenderer.invoke('task:create', input),
  update: (input) => ipcRenderer.invoke('task:update', input)
  // delete: (company_code) => ipcRenderer.invoke('company:delete', company_code)
}
export { taskApi }
