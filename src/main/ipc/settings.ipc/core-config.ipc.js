export const registeCoreConfigHandler = (ipcMain, configDb) => {
  async function getCompanies() {
    return configDb.knex('core-config').select('*')
  }

  async function upsertCompany(event, input) {
    const { company_code, company_name, company_logo } = input
    return configDb
      .knex('core-config')
      .insert({
        company_code,
        company_name,
        company_logo,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('core-config_code')
      .merge({
        company_name,
        company_logo,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteCompany(event, company_code) {
    return configDb.knex('core-config').where({ company_code }).del()
  }

  ipcMain.handle('core-config:getAll', getCompanies)
  ipcMain.handle('core-config:upsert', upsertCompany)
  ipcMain.handle('core-config:delete', deleteCompany)
}
