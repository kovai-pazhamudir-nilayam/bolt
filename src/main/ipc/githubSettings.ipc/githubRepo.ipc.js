export const registerGithubRepoHandler = (ipcMain, configDb) => {
  async function getGithubRepo() {
    return configDb.knex('github_repo').select('*')
  }

  async function upsertGithubRepo(event, input) {
    const { company_code, repo_name } = input

    return configDb
      .knex('github_repo')
      .insert({
        company_code,
        repo_name,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('github_repo')
      .merge({
        company_code,
        repo_name,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteGithubRepo(event, github_repo) {
    return configDb.knex('github_repo').where({ github_repo }).del()
  }

  ipcMain.handle('githubRepo:getAll', getGithubRepo)
  ipcMain.handle('githubRepo:upsert', upsertGithubRepo)
  ipcMain.handle('githubRepo:delete', deleteGithubRepo)
}
