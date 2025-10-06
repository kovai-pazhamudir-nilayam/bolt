export const registeCoreConfigHandler = (ipcMain, configDb) => {
  async function getAllCoreConfig() {
    return configDb.knex('core_config').select('*')
  }

  async function upsertCoreConfig(_event, input) {
    const { company_code, env_code, base_url, auth_api, auth_api_key } = input
    return configDb
      .knex('core_config')
      .insert({
        company_code,
        env_code,
        base_url,
        auth_api,
        auth_api_key,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict(['company_code', 'env_code'])
      .merge({
        base_url,
        auth_api,
        auth_api_key,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteCoreConfig(_event, { company_code, env_code }) {
    return configDb.knex('core_config').where({ company_code, env_code }).del()
  }

  async function getOneCoreConfig(_event, { company_code, env_code }) {
    return configDb.knex('core_config').where({ company_code, env_code }).first()
  }

  ipcMain.handle('core-config:getAll', getAllCoreConfig)
  ipcMain.handle('core-config:getOne', getOneCoreConfig)
  ipcMain.handle('core-config:upsert', upsertCoreConfig)
  ipcMain.handle('core-config:delete', deleteCoreConfig)
}
