import { ipcRenderer } from 'electron'

const notes = {
  getAll: (filters) => ipcRenderer.invoke('notes:getAll', filters),
  getById: (id) => ipcRenderer.invoke('notes:getById', id),
  upsert: (input) => ipcRenderer.invoke('notes:upsert', input),
  delete: (id) => ipcRenderer.invoke('notes:delete', id),
  addAttachment: (data) => ipcRenderer.invoke('notes:addAttachment', data),
  removeAttachment: (attachment_id) => ipcRenderer.invoke('notes:removeAttachment', attachment_id),
  getAttachmentPath: (attachment_id) => ipcRenderer.invoke('notes:getAttachmentPath', attachment_id),
  getAttachmentInfo: (attachment_id) => ipcRenderer.invoke('notes:getAttachmentInfo', attachment_id),
  getCategories: () => ipcRenderer.invoke('notes:getCategories')
}

const notesAPI = {
  notes: notes
}

export { notesAPI }
