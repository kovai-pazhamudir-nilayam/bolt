const dbBackupAPI = {
  getTables: () => {},
  getTableRecords: () => {},
  exportBackup: () => {},
  importBackup: () => {},
  getTableSchema: () => {},
  insertRecord: () => {}
}

const dbBackupDB = {
  getTables: () => window.dbBackupAPI.dbBackup.getTables(),
  getTableRecords: (tableName) => window.dbBackupAPI.dbBackup.getTableRecords(tableName),
  exportBackup: (data) => window.dbBackupAPI.dbBackup.exportBackup(data),
  importBackup: () => window.dbBackupAPI.dbBackup.importBackup(),
  getTableSchema: (tableName) => window.dbBackupAPI.dbBackup.getTableSchema(tableName),
  insertRecord: (data) => window.dbBackupAPI.dbBackup.insertRecord(data)
}

const dbBackupFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { dbBackupRepo: dbBackupAPI }
  }
  return { dbBackupRepo: dbBackupDB }
}

export { dbBackupFactory }
