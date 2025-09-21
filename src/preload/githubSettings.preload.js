import { ipcRenderer } from 'electron'

const githubConfig = {
  getAll: () => ipcRenderer.invoke('githubConfig:getAll'),
  upsert: (input) => ipcRenderer.invoke('githubConfig:upsert', input),
  delete: (company_code) => ipcRenderer.invoke('githubConfig:delete', company_code)
}

const githubUser = {
  getAll: () => ipcRenderer.invoke('githubUser:getAll'),
  upsert: (input) => ipcRenderer.invoke('githubUser:upsert', input),
  delete: (company_code) => ipcRenderer.invoke('githubUser:delete', company_code)
}
const githubRepo = {
  getAll: () => ipcRenderer.invoke('githubRepo:getAll'),
  upsert: (input) => ipcRenderer.invoke('githubRepo:upsert', input),
  delete: (company_code) => ipcRenderer.invoke('githubRepo:delete', company_code),
  sync: (company_code) => ipcRenderer.invoke('githubRepo:sync', company_code),
  access: (input) => ipcRenderer.invoke('githubRepo:access', input),
  create: (input) => ipcRenderer.invoke('githubRepo:create', input)
}

const githubSettingsApi = {
  githubConfig,
  githubUser,
  githubRepo
}

export { githubSettingsApi }
