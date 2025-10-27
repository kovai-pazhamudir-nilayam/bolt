export const registerUserProfileHandler = (ipcMain, configDb) => {
  async function getAllUserProfiles() {
    return configDb.knex('user_profile').select('*').orderBy('created_at', 'desc')
  }

  async function getUserProfileByPhone(event, phone_number) {
    return configDb.knex('user_profile').where({ phone_number }).first()
  }

  async function getUserProfileByCompanyEnvironment(event, { company_code, env_code }) {
    // Now we search through user_ids instead
    const userIds = await configDb.knex('user_ids').where({ company_code, env_code }).first()

    if (!userIds) return null

    return configDb.knex('user_profile').where({ phone_number: userIds.phone_number }).first()
  }

  async function upsertUserProfile(event, input) {
    const { phone_number, name, email, password, features = {} } = input

    return configDb
      .knex('user_profile')
      .insert({
        phone_number,
        name,
        email,
        password,
        features: JSON.stringify(features),
        created_at: configDb.knex.fn.now(),
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('phone_number')
      .merge({
        name,
        email,
        password,
        features: JSON.stringify(features),
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteUserProfile(event, phone_number) {
    // Cascade delete will handle user_ids
    return configDb.knex('user_profile').where({ phone_number }).del()
  }

  async function updateUserFeatures(event, { phone_number, features }) {
    return configDb
      .knex('user_profile')
      .where({ phone_number })
      .update({
        features: JSON.stringify(features),
        updated_at: configDb.knex.fn.now()
      })
  }

  // User IDs handlers
  async function getUserIdsByPhone(event, phone_number) {
    return configDb.knex('user_ids').where({ phone_number }).orderBy('created_at', 'desc')
  }

  async function upsertUserIds(event, { phone_number, user_ids }) {
    // Delete existing user_ids for this phone_number
    await configDb.knex('user_ids').where({ phone_number }).del()

    // Insert new user_ids
    if (user_ids && user_ids.length > 0) {
      const insertData = user_ids.map((item) => ({
        phone_number,
        user_id: item.user_id,
        company_code: item.company_code,
        env_code: item.env_code,
        created_at: configDb.knex.fn.now(),
        updated_at: configDb.knex.fn.now()
      }))
      await configDb.knex('user_ids').insert(insertData)
    }

    return { success: true }
  }

  async function deleteUserIds(event, phone_number) {
    return configDb.knex('user_ids').where({ phone_number }).del()
  }

  ipcMain.handle('userProfile:getAll', getAllUserProfiles)
  ipcMain.handle('userProfile:getByPhone', getUserProfileByPhone)
  ipcMain.handle('userProfile:getByCompanyEnvironment', getUserProfileByCompanyEnvironment)
  ipcMain.handle('userProfile:upsert', upsertUserProfile)
  ipcMain.handle('userProfile:delete', deleteUserProfile)
  ipcMain.handle('userProfile:updateFeatures', updateUserFeatures)

  // User IDs handlers
  ipcMain.handle('userProfile:getUserIdsByPhone', getUserIdsByPhone)
  ipcMain.handle('userProfile:upsertUserIds', upsertUserIds)
  ipcMain.handle('userProfile:deleteUserIds', deleteUserIds)
}
