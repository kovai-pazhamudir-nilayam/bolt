export const registeGCPProjectConfigHandler = (ipcMain, configDb) => {
  async function getAllGcpConfig() {
    return configDb.knex('gcp_project_config').select('*')
  }
  async function getOneGcpConfig(_event, input) {
    const { company_code, env_code } = input
    const result = await configDb
      .knex('gcp_project_config')
      .modify(function (queryBuilder) {
        if (company_code) {
          queryBuilder.where('company_code', company_code)
        }
        if (env_code) {
          queryBuilder.where('env_code', env_code)
        }
      })
      .first()

    if (!result) {
      throw new Error(
        `GCP Project Config not found for company_code: ${company_code}, env_code: ${env_code}`
      )
    }
    return result
  }

  async function upsertGcpProjectConfig(_event, input) {
    return configDb
      .knex('gcp_project_config')
      .insert({
        ...input,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict(['company_code', 'env_code'])
      .merge({
        ...input,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteGcpConfig(_event, { company_code, env_code }) {
    return configDb.knex('gcp_project_config').where({ env_code, company_code }).del()
  }

  ipcMain.handle('gcp-project-config:getOne', getOneGcpConfig)
  ipcMain.handle('gcp-project-config:getAll', getAllGcpConfig)
  ipcMain.handle('gcp-project-config:upsert', upsertGcpProjectConfig)
  ipcMain.handle('gcp-project-config:delete', deleteGcpConfig)
}
