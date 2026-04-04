export const registerFeatureConfigHandler = (ipcMain, configDb) => {
  async function getFeatureConfigs() {
    return configDb.knex('feature_config').select('*').orderBy('feature_name')
  }

  async function getFeatureConfigByKey(event, featureKey) {
    const result = await configDb.knex('feature_config').where({ feature_key: featureKey }).first()
    return result
  }

  async function getFeatureConfigsByType(event, featureType) {
    return configDb
      .knex('feature_config')
      .where({ feature_type: featureType })
      .orderBy('feature_name')
  }

  async function upsertFeatureConfig(event, input) {
    const {
      feature_key,
      feature_name,
      feature_type,
      access_level,
      description,
      is_superadmin_only
    } = input

    return configDb
      .knex('feature_config')
      .insert({
        feature_key,
        feature_name,
        feature_type,
        access_level,
        description,
        is_superadmin_only: is_superadmin_only || false,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('feature_key')
      .merge({
        feature_name,
        feature_type,
        access_level,
        description,
        is_superadmin_only: is_superadmin_only || false,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function updateFeatureConfigAccessLevel(event, { featureKey, accessLevel }) {
    return configDb.knex('feature_config').where({ feature_key: featureKey }).update({
      access_level: accessLevel,
      updated_at: configDb.knex.fn.now()
    })
  }

  async function updateRoleAccess(event, { featureKey, role, access }) {
    const column = role === 'editor' ? 'editor_access' : 'viewer_access'
    return configDb
      .knex('feature_config')
      .where({ feature_key: featureKey })
      .update({
        [column]: access,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteFeatureConfig(event, featureKey) {
    return configDb.knex('feature_config').where({ feature_key: featureKey }).del()
  }

  async function resetFeatureConfigs(event) {
    // Reset all feature configs to default 'write' access level
    return configDb.knex('feature_config').update({
      access_level: 'write',
      updated_at: configDb.knex.fn.now()
    })
  }

  async function getSuperadminFeatures() {
    return configDb
      .knex('feature_config')
      .where({ is_superadmin_only: true })
      .orderBy('feature_name')
  }

  ipcMain.handle('feature-config:getAll', getFeatureConfigs)
  ipcMain.handle('feature-config:getByKey', getFeatureConfigByKey)
  ipcMain.handle('feature-config:getByType', getFeatureConfigsByType)
  ipcMain.handle('feature-config:upsert', upsertFeatureConfig)
  ipcMain.handle('feature-config:updateAccessLevel', updateFeatureConfigAccessLevel)
  ipcMain.handle('feature-config:updateRoleAccess', updateRoleAccess)
  ipcMain.handle('feature-config:delete', deleteFeatureConfig)
  ipcMain.handle('feature-config:reset', resetFeatureConfigs)
  ipcMain.handle('feature-config:getSuperadminFeatures', getSuperadminFeatures)
}
