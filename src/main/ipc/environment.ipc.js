/**
 * Environments IPC Handler
 */

export const registerEnvironmentHandler = (ipcMain, configDb) => {
  ipcMain.handle('/get/environment', async () => {
    try {
      return await configDb.knex('environment').select('*').orderBy('name')
    } catch (error) {
      console.error('Error getting environment:', error)
      return []
    }
  })

  ipcMain.handle('/add/environment', async (event, code, name) => {
    try {
      return await configDb.knex('environment').insert({ code, name })
    } catch (error) {
      console.error('Error adding environment:', error)
      throw error
    }
  })

  ipcMain.handle('/update/environment', async (event, id, code, name) => {
    try {
      return await configDb
        .knex('environment')
        .where({ id })
        .update({ code, name, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating environment:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/environment', async (event, id) => {
    try {
      return await configDb.knex('environment').where({ id }).del()
    } catch (error) {
      console.error('Error deleting environment:', error)
      throw error
    }
  })
}
