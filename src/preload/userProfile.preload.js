import { ipcRenderer } from 'electron'

const userProfile = {
  getAll: () => ipcRenderer.invoke('userProfile:getAll'),
  getByPhone: (phone_number) => ipcRenderer.invoke('userProfile:getByPhone', phone_number),
  getByCompanyEnvironment: (input) => ipcRenderer.invoke('userProfile:getByCompanyEnvironment', input),
  upsert: (input) => ipcRenderer.invoke('userProfile:upsert', input),
  delete: (phone_number) => ipcRenderer.invoke('userProfile:delete', phone_number),
  updateFeatures: (input) => ipcRenderer.invoke('userProfile:updateFeatures', input),
  getUserIdsByPhone: (phone_number) => ipcRenderer.invoke('userProfile:getUserIdsByPhone', phone_number),
  upsertUserIds: (input) => ipcRenderer.invoke('userProfile:upsertUserIds', input),
  deleteUserIds: (phone_number) => ipcRenderer.invoke('userProfile:deleteUserIds', phone_number)
}

const userProfileAPI = {
  userProfile
}

export { userProfileAPI }
