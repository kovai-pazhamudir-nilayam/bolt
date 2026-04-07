import { ipcRenderer } from 'electron'

const dbBackup = {
  getTables: () => ipcRenderer.invoke('dbBackup:getTables'),
  getTableRecords: (tableName) => ipcRenderer.invoke('dbBackup:getTableRecords', tableName),
  exportBackup: (data) => ipcRenderer.invoke('dbBackup:exportBackup', data),
  importBackup: () => ipcRenderer.invoke('dbBackup:importBackup'),
  getTableSchema: (tableName) => ipcRenderer.invoke('dbBackup:getTableSchema', tableName),
  insertRecord: (data) => ipcRenderer.invoke('dbBackup:insertRecord', data),
  updateRecord: (data) => ipcRenderer.invoke('dbBackup:updateRecord', data),
  deleteRecord: (data) => ipcRenderer.invoke('dbBackup:deleteRecord', data)
}

export const dbBackupAPI = { dbBackup }
