import { ipcRenderer } from 'electron'

export const kanbanTaskAPI = {
  kanbanTask: {
    getAll: () => ipcRenderer.invoke('kanbanTask:getAll'),
    upsert: (task) => ipcRenderer.invoke('kanbanTask:upsert', task),
    delete: (id) => ipcRenderer.invoke('kanbanTask:delete', id)
  }
}
