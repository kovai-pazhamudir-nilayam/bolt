/**
 * GitHub Users IPC handlers
 */

export const registerGithubUsersHandlers = (ipcMain, configDb) => {
  // IPC handlers for GitHub user management
  ipcMain.handle('github-users-get-all', async () => {
    try {
      return await configDb.knex('users').select('*').orderBy('name')
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  })

  ipcMain.handle('github-users-add', async (event, name, githubHandle) => {
    try {
      return await configDb.knex('users').insert({ name, github_handle: githubHandle })
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  })

  ipcMain.handle('github-users-update', async (event, id, name, githubHandle) => {
    try {
      return await configDb
        .knex('users')
        .where({ id })
        .update({ name, github_handle: githubHandle, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  })

  ipcMain.handle('github-users-delete', async (event, id) => {
    try {
      return await configDb.knex('users').where({ id }).del()
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  })
}
