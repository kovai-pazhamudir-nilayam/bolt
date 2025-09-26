export const registerGithuSecretHandler = (ipcMain, configDb) => {
  async function getGithubSecret() {
    return configDb.knex('github_secret').select('*')
  }

  async function upsertGithubSecret(_event, input) {
    return configDb
      .knex('github_secret')
      .insert({
        ...input,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict(['company_code', 'secret_name'])
      .merge({
        ...input,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteGithubSecret(_event, secret_name, company_code) {
    return configDb.knex('github_secret').where({ secret_name, company_code }).del()
  }

  ipcMain.handle('githubSecret:getAll', getGithubSecret)
  ipcMain.handle('githubSecret:upsert', upsertGithubSecret)
  ipcMain.handle('githubSecret:delete', deleteGithubSecret)
}
