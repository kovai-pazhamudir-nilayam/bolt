export const registerGithubUserHandler = (ipcMain, configDb) => {
  async function getGithubUser() {
    return configDb.knex('github_user').select('*')
  }

  async function upsertGithubUser(event, input) {
    const { github_handle, name } = input

    return configDb
      .knex('github_user')
      .insert({
        github_handle,
        name,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('github_handle')
      .merge({
        github_handle,
        name,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteGithubUser(event, github_handle) {
    return configDb.knex('github_user').where({ github_handle }).del()
  }

  ipcMain.handle('githubUser:getAll', getGithubUser)
  ipcMain.handle('githubUser:upsert', upsertGithubUser)
  ipcMain.handle('githubUser:delete', deleteGithubUser)
}
