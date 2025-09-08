/**
 * GitHub Users IPC Handler
 */

export const registerGithubUserHandler = (ipcMain, configDb) => {
  // IPC Handler for GitHub user management
  ipcMain.handle('/get/github-user', async () => {
    try {
      return await configDb.knex('github_user').select('*').orderBy('name')
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  })

  ipcMain.handle('/add/github-user', async (event, name, githubHandle) => {
    try {
      return await configDb.knex('github_user').insert({ name, github_handle: githubHandle })
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  })

  ipcMain.handle('/update/github-user', async (event, id, name, githubHandle) => {
    try {
      return await configDb
        .knex('github_user')
        .where({ id })
        .update({ name, github_handle: githubHandle, updated_at: configDb.knex.fn.now() })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/github-user', async (event, id) => {
    try {
      return await configDb.knex('github_user').where({ id }).del()
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  })
}
