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

  ipcMain.handle('githubRepoAccss:getAll', getGithubUser)
  ipcMain.handle('githubRepoAccss:upsert', upsertGithubUser)
  ipcMain.handle('githubRepoAccss:delete', deleteGithubUser)
}
