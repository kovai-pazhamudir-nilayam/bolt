export const registerGithubConfigHandler = (ipcMain, configDb) => {
  async function getGithubConfig() {
    return configDb.knex('github_config').select('*')
  }

  async function upsertGithubConfig(event, input) {
    return configDb
      .knex('github_config')
      .insert({
        ...input,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('company_code')
      .merge({
        ...input,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteGithubConfig(event, company_code) {
    return configDb.knex('github_config').where({ company_code }).del()
  }

  ipcMain.handle('githubConfig:getAll', getGithubConfig)
  ipcMain.handle('githubConfig:upsert', upsertGithubConfig)
  ipcMain.handle('githubConfig:delete', deleteGithubConfig)
}
