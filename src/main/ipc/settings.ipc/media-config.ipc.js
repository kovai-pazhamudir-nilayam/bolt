export const registerMediaConfigHandler = (ipcMain, configDb) => {
  async function getMediaConfigs() {
    return configDb.knex('media_config').select('*')
  }

  async function getMediaConfig(_event, id) {
    return configDb.knex('media_config').select('*').where('media_config.id', id).first()
  }

  async function upsertMediaConfig(_event, input) {
    const { company_code, env_code, type, bucket_path, id } = input

    const data = {
      company_code,
      env_code,
      type,
      bucket_path,
      updated_at: configDb.knex.fn.now()
    }

    if (id) {
      // Update existing record
      return configDb.knex('media_config').where('id', id).update(data)
    } else {
      // Insert new record
      return configDb.knex('media_config').insert({
        ...data,
        created_at: configDb.knex.fn.now()
      })
    }
  }

  async function deleteMediaConfig(_event, id) {
    return configDb.knex('media_config').where('id', id).del()
  }

  ipcMain.handle('media-config:getAll', getMediaConfigs)
  ipcMain.handle('media-config:getOne', getMediaConfig)
  ipcMain.handle('media-config:upsert', upsertMediaConfig)
  ipcMain.handle('media-config:delete', deleteMediaConfig)
}
