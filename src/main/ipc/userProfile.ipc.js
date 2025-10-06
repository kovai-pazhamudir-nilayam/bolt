export const registerUserProfileHandler = (ipcMain, configDb) => {
  async function getAllUserProfiles() {
    return configDb.knex('user_profile').select('*').orderBy('created_at', 'desc')
  }

  async function getUserProfileByPhone(event, phone_number) {
    return configDb.knex('user_profile').where({ phone_number }).first()
  }

  async function getUserProfileByCompanyEnvironment(event, { company_code, env_code }) {
    return configDb.knex('user_profile').where({ company_code, env_code }).first()
  }

  async function upsertUserProfile(event, input) {
    const { phone_number, name, email, password, company_code, env_code, features = {} } = input

    return configDb
      .knex('user_profile')
      .insert({
        phone_number,
        name,
        email,
        password,
        company_code,
        env_code,
        features: JSON.stringify(features),
        created_at: configDb.knex.fn.now(),
        updated_at: configDb.knex.fn.now()
      })
      .onConflict('phone_number')
      .merge({
        name,
        email,
        password,
        company_code,
        env_code,
        features: JSON.stringify(features),
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteUserProfile(event, phone_number) {
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

  ipcMain.handle('userProfile:getAll', getAllUserProfiles)
  ipcMain.handle('userProfile:getByPhone', getUserProfileByPhone)
  ipcMain.handle('userProfile:getByCompanyEnvironment', getUserProfileByCompanyEnvironment)
  ipcMain.handle('userProfile:upsert', upsertUserProfile)
  ipcMain.handle('userProfile:delete', deleteUserProfile)
  ipcMain.handle('userProfile:updateFeatures', updateUserFeatures)
}
