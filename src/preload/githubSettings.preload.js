import { ipcRenderer } from 'electron'
// Companies APIs
const githubConfig = {
  getAll: () => ipcRenderer.invoke('githubConfig:getAll'),
  upsert: (input) => ipcRenderer.invoke('githubConfig:upsert', input),
  delete: (company_code) => ipcRenderer.invoke('githubConfig:delete', company_code)
}

const githubSettingsApi = {
  githubConfig
}
export { githubSettingsApi }
