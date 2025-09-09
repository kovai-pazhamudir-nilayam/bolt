/**
 * GitHub Configurations IPC Handler
 */

export const registerGithubConfigHandler = (ipcMain, configDb) => {
  ipcMain.handle('/get/github-config', async () => {
    try {
      return await configDb
        .knex('github_config as gc')
        .select('gc.*', 'c.code as company_code', 'c.name as company_name')
        .join('company as c', 'gc.company_id', 'c.id')
        .orderBy('c.name')
    } catch (error) {
      console.error('Error getting GitHub configs:', error)
      return []
    }
  })

  ipcMain.handle('/add/github-config', async (event, companyId, githubToken, owner) => {
    try {
      return await configDb
        .knex('github_config')
        .insert({ company_id: companyId, github_token: githubToken, owner })
    } catch (error) {
      console.error('Error adding GitHub config:', error)
      throw error
    }
  })

  ipcMain.handle('/update/github-config', async (event, id, companyId, githubToken, owner) => {
    try {
      return await configDb.knex('github_config').where({ id }).update({
        company_id: companyId,
        github_token: githubToken,
        owner,
        updated_at: configDb.knex.fn.now()
      })
    } catch (error) {
      console.error('Error updating GitHub config:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/github-config', async (event, id) => {
    try {
      return await configDb.knex('github_config').where({ id }).del()
    } catch (error) {
      console.error('Error deleting GitHub config:', error)
      throw error
    }
  })
}
