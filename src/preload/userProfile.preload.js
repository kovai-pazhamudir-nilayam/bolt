import { ipcRenderer } from 'electron'

const userProfile = {
  getAll: () => ipcRenderer.invoke('userProfile:getAll'),
  getByPhone: (phone_number) => ipcRenderer.invoke('userProfile:getByPhone', phone_number),
  upsert: (input) => ipcRenderer.invoke('userProfile:upsert', input),
  delete: (phone_number) => ipcRenderer.invoke('userProfile:delete', phone_number)
}

const userProfileAPI = {
  userProfile
}

export { userProfileAPI }
