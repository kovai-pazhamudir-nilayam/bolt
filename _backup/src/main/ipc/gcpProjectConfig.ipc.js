/**
 * GCP Project Configurations IPC Handler
 */

export const registerGcpProjectConfigHandler = (ipcMain, configDb) => {
  ipcMain.handle('/get/gcp-project-config', async () => {
    try {
      return await configDb
        .knex('gcp_project_configs as gpc')
        .select(
          'gpc.*',
          'c.code as company_code',
          'c.name as company_name',
          'e.code as environment_code',
          'e.name as environment_name'
        )
        .join('company as c', 'gpc.company_id', 'c.id')
        .join('environment as e', 'gpc.environment_id', 'e.id')
        .orderBy(['c.name', 'e.name'])
    } catch (error) {
      console.error('Error getting GCP project config:', error)
      return []
    }
  })

  ipcMain.handle(
    '/add/gcp-project-config',
    async (event, companyId, environmentId, gcpProject, gcpCluster, gcpRegion) => {
      try {
        return await configDb.knex('gcp_project_config').insert({
          company_id: companyId,
          environment_id: environmentId,
          gcp_project: gcpProject,
          gcp_cluster: gcpCluster,
          gcp_region: gcpRegion
        })
      } catch (error) {
        console.error('Error adding GCP project config:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    '/update/gcp-project-config',
    async (event, id, companyId, environmentId, gcpProject, gcpCluster, gcpRegion) => {
      try {
        return await configDb.knex('gcp_project_config').where({ id }).update({
          company_id: companyId,
          environment_id: environmentId,
          gcp_project: gcpProject,
          gcp_cluster: gcpCluster,
          gcp_region: gcpRegion,
          updated_at: configDb.knex.fn.now()
        })
      } catch (error) {
        console.error('Error updating GCP project config:', error)
        throw error
      }
    }
  )

  ipcMain.handle('/delete/gcp-project-config', async (event, id) => {
    try {
      return await configDb.knex('gcp_project_config').where({ id }).del()
    } catch (error) {
      console.error('Error deleting GCP project config:', error)
      throw error
    }
  })
}
