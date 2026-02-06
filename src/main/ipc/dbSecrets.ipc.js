export const registerDBSecretsHandler = (ipcMain, configDb) => {
  async function getAll() {
    return configDb.knex('db_secrets').select('*').orderBy('company_code', 'asc')
  }

  async function getById(event, id) {
    const entries = await configDb.knex('db_secrets').where({ id }).select('*')
    return entries[0] || null
  }

  async function upsert(event, input) {
    const { id, company_code, environment, db_host, db_name, db_user, db_password, notes } = input

    if (id) {
      // Update existing entry
      const [entry] = await configDb
        .knex('db_secrets')
        .where({ id })
        .update({
          company_code,
          environment,
          db_host,
          db_name,
          db_user,
          db_password,
          notes,
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    } else {
      // Create new entry
      const [entry] = await configDb
        .knex('db_secrets')
        .insert({
          company_code,
          environment,
          db_host,
          db_name,
          db_user,
          db_password,
          notes,
          created_at: configDb.knex.fn.now(),
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    }
  }

  async function deleteEntry(event, id) {
    return configDb.knex('db_secrets').where({ id }).del()
  }

  ipcMain.handle('dbSecrets:getAll', getAll)
  ipcMain.handle('dbSecrets:getById', getById)
  ipcMain.handle('dbSecrets:upsert', upsert)
  ipcMain.handle('dbSecrets:delete', deleteEntry)
}
