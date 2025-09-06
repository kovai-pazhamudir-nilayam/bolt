/**
 * Core Token Configurations IPC handlers
 */

export const registerCoreTokenConfigsHandlers = (ipcMain, configDb) => {
  ipcMain.handle('/get/core-token-configs', async () => {
    try {
      return await configDb
        .knex('core_token_configs as ctc')
        .select(
          'ctc.*',
          'c.code as company_code',
          'c.name as company_name',
          'e.code as environment_code',
          'e.name as environment_name'
        )
        .join('companies as c', 'ctc.company_id', 'c.id')
        .join('environments as e', 'ctc.environment_id', 'e.id')
        .orderBy(['c.name', 'e.name'])
    } catch (error) {
      console.error('Error getting core token configs:', error)
      return []
    }
  })

  ipcMain.handle(
    '/add/core-token-configs',
    async (event, companyId, environmentId, domain, tokenApi, authKey) => {
      try {
        return await configDb.knex('core_token_configs').insert({
          company_id: companyId,
          environment_id: environmentId,
          domain,
          token_api: tokenApi,
          auth_key: authKey
        })
      } catch (error) {
        console.error('Error adding core token config:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    '/update/core-token-configs',
    async (event, id, companyId, environmentId, domain, tokenApi, authKey) => {
      try {
        return await configDb
          .knex('core_token_configs')
          .where({ id })
          .update({
            company_id: companyId,
            environment_id: environmentId,
            domain,
            token_api: tokenApi,
            auth_key: authKey,
            updated_at: configDb.knex.fn.now()
          })
      } catch (error) {
        console.error('Error updating core token config:', error)
        throw error
      }
    }
  )

  ipcMain.handle('/delete/core-token-configs', async (event, id) => {
    try {
      return await configDb.knex('core_token_configs').where({ id }).del()
    } catch (error) {
      console.error('Error deleting core token config:', error)
      throw error
    }
  })
}
