/**
 * Companies IPC Handler
 */

export const registerCompanyHandler = (ipcMain, configDb) => {
  ipcMain.handle('/get/company', async () => {
    try {
      return await configDb.knex('company').select('*').orderBy('name')
    } catch (error) {
      console.error('Error getting company:', error)
      return []
    }
  })

  ipcMain.handle('/add/company', async (event, code, name, logo) => {
    try {
      return await configDb.knex('company').insert({ code, name, logo })
    } catch (error) {
      console.error('Error adding company:', error)
      throw error
    }
  })

  ipcMain.handle('/update/company', async (event, id, code, name, logo) => {
    try {
      return await configDb
        .knex('company')
        .where({ id })
        .update({ code, name, logo, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/company', async (event, id) => {
    try {
      return await configDb.knex('company').where({ id }).del()
    } catch (error) {
      console.error('Error deleting company:', error)
      throw error
    }
  })
}
