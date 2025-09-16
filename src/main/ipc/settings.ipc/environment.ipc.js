export const registerEnvironmentHandler = (ipcMain, configDb) => {
  async function getEnvironments() {
    return configDb.knex('environment').select('*')
  }

  async function upsertEnvironment(event, { env_code, env_name }) {
    return configDb
      .knex('environment')
      .insert({
        env_code,
        env_name,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('env_code')
      .merge({
        env_name,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteEnvironment(event, env_code) {
    return configDb.knex('environment').where({ env_code }).del()
  }

  ipcMain.handle('environment:getAll', getEnvironments)
  ipcMain.handle('environment:upsert', upsertEnvironment)
  ipcMain.handle('environment:delete', deleteEnvironment)
}
