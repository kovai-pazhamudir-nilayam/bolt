export const registerSavedDbQueryHandler = (ipcMain, configDb) => {
  async function getAll() {
    return configDb.knex('saved_db_query').select('*').orderBy('id', 'desc')
  }

  async function getById(event, id) {
    const entries = await configDb.knex('saved_db_query').where({ id }).select('*')
    return entries[0] || null
  }

  async function upsert(event, input) {
    const { id, title, description, query, db_id } = input

    if (id) {
      // Update existing entry
      const [entry] = await configDb
        .knex('saved_db_query')
        .where({ id })
        .update({
          title,
          description,
          query,
          db_id,
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    } else {
      // Create new entry
      const [entry] = await configDb
        .knex('saved_db_query')
        .insert({
          title,
          description,
          query,
          db_id,
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
