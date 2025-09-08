/**
 * GitHub Users IPC handlers
 */

export const registerGithubUsersHandlers = (ipcMain, configDb) => {
  // IPC handlers for GitHub user management
  ipcMain.handle('/get/github-users', async () => {
    try {
      return await configDb.knex('github_users').select('*').orderBy('name')
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  })

  ipcMain.handle('/add/github-users', async (event, name, githubHandle) => {
    try {
      return await configDb.knex('github_users').insert({ name, github_handle: githubHandle })
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  })

  ipcMain.handle('/update/github-users', async (event, id, name, githubHandle) => {
    try {
      return await configDb
        .knex('github_users')
        .where({ id })
        .update({ name, github_handle: githubHandle, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/github-users', async (event, id) => {
    try {
      return await configDb.knex('github_users').where({ id }).del()
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  })
}
