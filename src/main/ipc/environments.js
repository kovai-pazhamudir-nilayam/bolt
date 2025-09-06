/**
 * Environments IPC handlers
 */

export const registerEnvironmentsHandlers = (ipcMain, configDb) => {
  ipcMain.handle('/get/environments', async () => {
    try {
      return await configDb.knex('environments').select('*').orderBy('name')
    } catch (error) {
      console.error('Error getting environments:', error)
      return []
    }
  })

  ipcMain.handle('/add/environments', async (event, code, name) => {
    try {
      return await configDb.knex('environments').insert({ code, name })
    } catch (error) {
      console.error('Error adding environment:', error)
      throw error
    }
  })

  ipcMain.handle('/update/environments', async (event, id, code, name) => {
    try {
      return await configDb.knex('environments')
        .where({ id })
        .update({ code, name, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating environment:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/environments', async (event, id) => {
    try {
      const [{ count: c1 }] = await configDb.knex('core_token_configs')
        .where({ environment_id: id })
        .count({ count: '*' })
      const [{ count: c2 }] = await configDb.knex('gcp_project_configs')
        .where({ environment_id: id })
        .count({ count: '*' })

      if (Number(c1) > 0 || Number(c2) > 0) {
        throw new Error('Cannot delete environment: it has dependent configurations')
      }

      return await configDb.knex('environments').where({ id }).del()
    } catch (error) {
      console.error('Error deleting environment:', error)
      throw error
    }
  })
}
