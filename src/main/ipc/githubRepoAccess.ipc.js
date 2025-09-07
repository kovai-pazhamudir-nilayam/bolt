/**
 * GitHub Repo Access IPC handlers
 */

export const registerGithubRepoAccessHandlers = (ipcMain, configDb) => {
  ipcMain.handle('/get/github-repo-access', async () => {
    try {
      return await configDb
        .knex('github_repo_access as gra')
        .select(
          'gra.*',
          'c.name as company_name',
          'gr.name as repo_name',
          'u.name as user_name',
          'u.github_handle'
        )
        .join('companies as c', 'gra.company_id', 'c.id')
        .join('github_repos as gr', 'gra.repo_id', 'gr.id')
        .join('users as u', 'gra.user_id', 'u.id')
        .orderBy(['c.name', 'gr.name', 'u.name'])
    } catch (error) {
      console.error('Error getting repo access:', error)
      return []
    }
  })

  ipcMain.handle('/add/github-repo-access', async (event, companyId, repoId, userId) => {
    try {
      return await configDb
        .knex('github_repo_access')
        .insert({ company_id: companyId, repo_id: repoId, user_id: userId })
        .onConflict(['company_id', 'repo_id', 'user_id'])
        .ignore()
    } catch (error) {
      console.error('Error adding repo access:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/github-repo-access', async (event, id) => {
    try {
      return await configDb.knex('github_repo_access').where({ id }).del()
    } catch (error) {
      console.error('Error deleting repo access:', error)
      throw error
    }
  })
}


