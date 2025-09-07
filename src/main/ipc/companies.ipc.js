/**
 * Companies IPC handlers
 */

export const registerCompaniesHandlers = (ipcMain, configDb) => {
  ipcMain.handle('/get/companies', async () => {
    try {
      return await configDb.knex('companies').select('*').orderBy('name')
    } catch (error) {
      console.error('Error getting companies:', error)
      return []
    }
  })

  ipcMain.handle('/add/companies', async (event, code, name, logo) => {
    try {
      return await configDb.knex('companies').insert({ code, name, logo })
    } catch (error) {
      console.error('Error adding company:', error)
      throw error
    }
  })

  ipcMain.handle('/update/companies', async (event, id, code, name, logo) => {
    try {
      return await configDb
        .knex('companies')
        .where({ id })
        .update({ code, name, logo, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/companies', async (event, id) => {
    try {
      const [{ count: c1 }] = await configDb
        .knex('core_token_configs')
        .where({ company_id: id })
        .count({ count: '*' })
      const [{ count: c2 }] = await configDb
        .knex('gcp_project_configs')
        .where({ company_id: id })
        .count({ count: '*' })
      const [{ count: c3 }] = await configDb
        .knex('github_configs')
        .where({ company_id: id })
        .count({ count: '*' })

      if (Number(c1) > 0 || Number(c2) > 0 || Number(c3) > 0) {
        throw new Error('Cannot delete company: it has dependent configurations')
      }

      return await configDb.knex('companies').where({ id }).del()
    } catch (error) {
      console.error('Error deleting company:', error)
      throw error
    }
  })
}
