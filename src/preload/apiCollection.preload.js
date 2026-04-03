import { ipcRenderer } from 'electron'

const apiCollection = {
  getAll: () => ipcRenderer.invoke('apiCollection:getAll'),
  upsert: (input) => ipcRenderer.invoke('apiCollection:upsert', input),
  delete: (id) => ipcRenderer.invoke('apiCollection:delete', id),
  run: (input) => ipcRenderer.invoke('apiCollection:run', input)
}

const apiCollectionAPI = {
  apiCollection
}

export { apiCollectionAPI }
