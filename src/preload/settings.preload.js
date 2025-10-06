import { ipcRenderer } from 'electron'
// Companies APIs
const company = {
  getAll: () => ipcRenderer.invoke('company:getAll'),
  upsert: (input) => ipcRenderer.invoke('company:upsert', input),
  delete: (company_code) => ipcRenderer.invoke('company:delete', company_code)
}

const environment = {
  getAll: () => ipcRenderer.invoke('environment:getAll'),
  upsert: (input) => ipcRenderer.invoke('environment:upsert', input),
  delete: (env_code) => ipcRenderer.invoke('environment:delete', env_code)
}

const gcpProjectConfig = {
  getAll: () => ipcRenderer.invoke('gcp-project-config:getAll'),
  getOne: (input) => ipcRenderer.invoke('gcp-project-config:getOne', input),
  upsert: (input) => ipcRenderer.invoke('gcp-project-config:upsert', input),
  delete: (input) => ipcRenderer.invoke('gcp-project-config:delete', input)
}

const mediaConfig = {
  getAll: () => ipcRenderer.invoke('media-config:getAll'),
  getOne: (input) => ipcRenderer.invoke('media-config:getOne', input),
  upsert: (input) => ipcRenderer.invoke('media-config:upsert', input),
  delete: (input) => ipcRenderer.invoke('media-config:delete', input)
}

const passwordManager = {
  getAll: () => ipcRenderer.invoke('passwordManager:getAll'),
  getById: (id) => ipcRenderer.invoke('passwordManager:getById', id),
  create: (input) => ipcRenderer.invoke('passwordManager:create', input),
  update: (input) => ipcRenderer.invoke('passwordManager:update', input),
  upsert: (input) => ipcRenderer.invoke('passwordManager:upsert', input),
  delete: (id) => ipcRenderer.invoke('passwordManager:delete', id)
}

const settingsAPI = {
  company,
  environment,
  gcpProjectConfig,
  mediaConfig,
  passwordManager
}
export { settingsAPI }
