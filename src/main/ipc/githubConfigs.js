/**
 * GitHub Configurations IPC handlers
 */

export const registerGithubConfigsHandlers = (ipcMain, configDb) => {
  ipcMain.handle('/get/github-configs', async () => {
    try {
      return await configDb
        .knex('github_configs as gc')
        .select('gc.*', 'c.code as company_code', 'c.name as company_name')
        .join('companies as c', 'gc.company_id', 'c.id')
        .orderBy('c.name')
    } catch (error) {
      console.error('Error getting GitHub configs:', error)
      return []
    }
  })

  ipcMain.handle('/add/github-configs', async (event, companyId, githubToken, owner) => {
    try {
      return await configDb.knex('github_configs').insert({ company_id: companyId, github_token: githubToken, owner })
    } catch (error) {
      console.error('Error adding GitHub config:', error)
      throw error
    }
  })

  ipcMain.handle('/update/github-configs', async (event, id, companyId, githubToken, owner) => {
    try {
      return await configDb
        .knex('github_configs')
        .where({ id })
        .update({ company_id: companyId, github_token: githubToken, owner, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating GitHub config:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/github-configs', async (event, id) => {
    try {
      return await configDb.knex('github_configs').where({ id }).del()
    } catch (error) {
      console.error('Error deleting GitHub config:', error)
      throw error
    }
  })
}
