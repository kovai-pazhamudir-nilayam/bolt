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
  upsert: (input) => ipcRenderer.invoke('gcp-project-config:upsert', input),
  delete: (input) => ipcRenderer.invoke('gcp-project-config:delete', input)
}

const settingsApi = {
  company,
  environment,
  gcpProjectConfig
}
export { settingsApi }
