import { ipcRenderer } from 'electron'

const passwordManager = {
  getAll: () => ipcRenderer.invoke('passwordManager:getAll'),
  getById: (id) => ipcRenderer.invoke('passwordManager:getById', id),
  create: (input) => ipcRenderer.invoke('passwordManager:create', input),
  update: (input) => ipcRenderer.invoke('passwordManager:update', input),
  upsert: (input) => ipcRenderer.invoke('passwordManager:upsert', input),
  delete: (id) => ipcRenderer.invoke('passwordManager:delete', id)
}

const passwordManagerAPI = {
  passwordManager: passwordManager
}
export { passwordManagerAPI }
