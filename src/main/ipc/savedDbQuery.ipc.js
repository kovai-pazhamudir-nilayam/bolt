export const registerSavedDbQueryHandler = (ipcMain, configDb) => {
  async function getAll() {
    return configDb.knex('saved_db_query').select('*').orderBy('id', 'desc')
  }

  async function getById(event, id) {
    const entries = await configDb.knex('saved_db_query').where({ id }).select('*')
    return entries[0] || null
  }

  async function upsert(event, input) {
    const { id, title, description, query, company_code, db_name } = input

    if (id) {
      const [entry] = await configDb
        .knex('saved_db_query')
        .where({ id })
        .update({
          title,
          description,
          query,
          company_code,
          db_name,
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    } else {
      const [entry] = await configDb
        .knex('saved_db_query')
        .insert({
          title,
          description,
          query,
          company_code,
          db_name,
          created_at: configDb.knex.fn.now(),
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    }
  }

  async function deleteEntry(event, id) {
    return configDb.knex('saved_db_query').where({ id }).del()
  }

  ipcMain.handle('savedDbQuery:getAll', getAll)
  ipcMain.handle('savedDbQuery:getById', getById)
  ipcMain.handle('savedDbQuery:upsert', upsert)
  ipcMain.handle('savedDbQuery:delete', deleteEntry)
}
