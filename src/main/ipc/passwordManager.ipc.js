export const registerPasswordManagerHandler = (ipcMain, configDb) => {
  async function getPasswordEntries() {
    return configDb.knex('password_manager').select('*').orderBy('created_at', 'desc')
  }

  async function getPasswordEntryById(event, id) {
    const entries = await configDb.knex('password_manager').where({ id }).select('*')
    return entries[0] || null
  }

  async function createPasswordEntry(event, input) {
    const { company_url, type, username, password, title, notes } = input
    const [entry] = await configDb
      .knex('password_manager')
      .insert({
        company_url,
        type,
        username,
        password,
        title,
        notes,
        created_at: configDb.knex.fn.now(),
        updated_at: configDb.knex.fn.now()
      })
      .returning('*')
    return entry
  }

  async function updatePasswordEntry(event, input) {
    const { id, company_url, type, username, password, title, notes } = input
    const [entry] = await configDb
      .knex('password_manager')
      .where({ id })
      .update({
        company_url,
        type,
        username,
        password,
        title,
        notes,
        updated_at: configDb.knex.fn.now()
      })
      .returning('*')
    return entry
  }

  async function deletePasswordEntry(event, id) {
    return configDb.knex('password_manager').where({ id }).del()
  }

  async function upsertPasswordEntry(event, input) {
    const { id, company_url, type, username, password, title, notes } = input

    if (id) {
      // Update existing entry
      const [entry] = await configDb
        .knex('password_manager')
        .where({ id })
        .update({
          company_url,
          type,
          username,
          password,
          title,
          notes,
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    } else {
      // Create new entry
      const [entry] = await configDb
        .knex('password_manager')
        .insert({
          company_url,
          type,
          username,
          password,
          title,
          notes,
          created_at: configDb.knex.fn.now(),
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    }
  }

  ipcMain.handle('passwordManager:getAll', getPasswordEntries)
  ipcMain.handle('passwordManager:getById', getPasswordEntryById)
  ipcMain.handle('passwordManager:create', createPasswordEntry)
  ipcMain.handle('passwordManager:update', updatePasswordEntry)
  ipcMain.handle('passwordManager:upsert', upsertPasswordEntry)
  ipcMain.handle('passwordManager:delete', deletePasswordEntry)
}
