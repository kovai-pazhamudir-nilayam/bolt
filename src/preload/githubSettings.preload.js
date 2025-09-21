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

const githubSettingsApi = {
  githubConfig,
  githubUser
}

export { githubSettingsApi }
