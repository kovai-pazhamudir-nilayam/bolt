export function registerBackupHandler(ipcMain, configDb) {
  // Export database
  ipcMain.handle('export_database', async () => {
    try {
      const backupData = await configDb.exportDatabase()
      return {
        success: true,
        data: backupData
      }
    } catch (error) {
      console.error('Error exporting database:', error)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // Import database
  ipcMain.handle('import_database', async (event, { data }) => {
    try {
      await configDb.importDatabase(data)
      return {
        success: true
      }
    } catch (error) {
      console.error('Error importing database:', error)
      return {
        success: false,
        error: error.message
      }
    }
  })
}
