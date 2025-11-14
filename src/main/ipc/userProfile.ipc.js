export const registerUserProfileHandler = (ipcMain, configDb) => {
  async function getAllUserProfiles() {
    return configDb.knex('user_profile').select('*').orderBy('created_at', 'desc')
  }

  async function getUserProfileByPhone(_event, phone_number) {
    return configDb.knex('user_profile').where({ phone_number }).first()
  }

  async function upsertUserProfile(_event, input) {
    const { phone_number, name, email, password, user_ids = {} } = input

    return configDb
      .knex('user_profile')
      .insert({
        phone_number,
        name,
        email,
        password,
        user_ids: JSON.stringify(user_ids),
        created_at: configDb.knex.fn.now(),
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('phone_number')
      .merge({
        name,
        email,
        password,
        user_ids: JSON.stringify(user_ids),
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteUserProfile(_event, phone_number) {
    // Cascade delete will handle user_ids
    return configDb.knex('user_profile').where({ phone_number }).del()
  }

  ipcMain.handle('userProfile:getAll', getAllUserProfiles)
  ipcMain.handle('userProfile:getByPhone', getUserProfileByPhone)
  ipcMain.handle('userProfile:upsert', upsertUserProfile)
  ipcMain.handle('userProfile:delete', deleteUserProfile)
}
