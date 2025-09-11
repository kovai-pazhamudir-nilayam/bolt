/**
 * GitHub Configurations IPC Handler
 */

export const registerGithubConfigHandler = (ipcMain, configDb) => {
  async function getConfigs() {
    try {
      return await configDb.knex('github_config').select('*')
    } catch (error) {
      console.error('Error getting GitHub configs:', error)
      throw error
    }
  }

  async function addConfig(event, input) {
    const { company_code, github_token, owner } = input
    try {
      return await configDb.knex('github_config').insert({ company_code, github_token, owner })
    } catch (error) {
      console.error('Error adding GitHub config:', error)
      throw error
    }
  }

  async function deleteConfig(event, id) {
    try {
      return await configDb.knex('github_config').where({ id }).del()
    } catch (error) {
      console.error('Error deleting GitHub config:', error)
      throw error
    }
  }

  ipcMain.handle('db:getConfigs', getConfigs)

  ipcMain.handle('db:addConfig', addConfig)

  ipcMain.handle('db:deleteConfig', deleteConfig)
}
