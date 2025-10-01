export const registeGCPProjectConfigHandler = (ipcMain, configDb) => {
  async function getCompanies() {
    return configDb.knex('gcp_project_config').select('*')
  }

  async function upsertCompany(_event, input) {
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

  async function deleteCompany(_event, { company_code, env_code }) {
    return configDb.knex('gcp_project_config').where({ env_code, company_code }).del()
  }

  ipcMain.handle('gcp-project-config:getAll', getCompanies)
  ipcMain.handle('gcp-project-config:upsert', upsertCompany)
  ipcMain.handle('gcp-project-config:delete', deleteCompany)
}
