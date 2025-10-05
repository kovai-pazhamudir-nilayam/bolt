export const registerCompanyHandler = (ipcMain, configDb) => {
  async function getCompanies() {
    return configDb.knex('company').select('*')
  }

  async function upsertCompany(event, input) {
    const { company_code, company_name, company_logo, support_portal_url } = input
    return configDb
      .knex('company')
      .insert({
        company_code,
        company_name,
        company_logo,
        support_portal_url,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('company_code')
      .merge({
        company_name,
        company_logo,
        support_portal_url,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteCompany(event, company_code) {
    return configDb.knex('company').where({ company_code }).del()
  }

  ipcMain.handle('company:getAll', getCompanies)
  ipcMain.handle('company:upsert', upsertCompany)
  ipcMain.handle('company:delete', deleteCompany)
}
