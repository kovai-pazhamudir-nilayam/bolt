import { ipcRenderer } from 'electron'

export const dbSecretsAPI = {
  dbSecrets: {
    getAll: () => ipcRenderer.invoke('dbSecrets:getAll'),
    getById: (id) => ipcRenderer.invoke('dbSecrets:getById', id),
    upsert: (input) => ipcRenderer.invoke('dbSecrets:upsert', input),
    delete: (id) => ipcRenderer.invoke('dbSecrets:delete', id)
  }
}
