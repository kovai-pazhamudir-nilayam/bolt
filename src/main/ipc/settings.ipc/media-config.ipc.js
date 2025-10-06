export const registerMediaConfigHandler = (ipcMain, configDb) => {
  async function getMediaConfigs() {
    return configDb.knex('media_config')
      .select(
        'media_config.*',
        'company.company_name',
        'environment.environment_name'
      )
      .leftJoin('company', 'media_config.company_code', 'company.company_code')
      .leftJoin('environment', 'media_config.environment_code', 'environment.environment_code')
      .orderBy('media_config.created_at', 'desc')
  }

  async function getMediaConfig(event, id) {
    return configDb.knex('media_config')
      .select(
        'media_config.*',
        'company.company_name',
        'environment.environment_name'
      )
      .leftJoin('company', 'media_config.company_code', 'company.company_code')
      .leftJoin('environment', 'media_config.environment_code', 'environment.environment_code')
      .where('media_config.id', id)
      .first()
  }

  async function upsertMediaConfig(event, input) {
    const { company_code, environment_code, type, bucket_path, id } = input
    
    const data = {
      company_code,
      environment_code,
      type,
      bucket_path,
      updated_at: configDb.knex.fn.now()
    }

    if (id) {
      // Update existing record
      return configDb.knex('media_config')
        .where('id', id)
        .update(data)
    } else {
      // Insert new record
      return configDb.knex('media_config')
        .insert({
          ...data,
          created_at: configDb.knex.fn.now()
        })
    }
  }

  async function deleteMediaConfig(event, id) {
    return configDb.knex('media_config').where('id', id).del()
  }

  ipcMain.handle('media-config:getAll', getMediaConfigs)
  ipcMain.handle('media-config:getOne', getMediaConfig)
  ipcMain.handle('media-config:upsert', upsertMediaConfig)
  ipcMain.handle('media-config:delete', deleteMediaConfig)
}
