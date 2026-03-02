import { ipcRenderer } from 'electron'

export const savedDbQueryAPI = {
  getAll: () => ipcRenderer.invoke('savedDbQuery:getAll'),
  getById: (id) => ipcRenderer.invoke('savedDbQuery:getById', id),
  upsert: (setting) => ipcRenderer.invoke('savedDbQuery:upsert', setting),
  delete: (id) => ipcRenderer.invoke('savedDbQuery:delete', id)
}
