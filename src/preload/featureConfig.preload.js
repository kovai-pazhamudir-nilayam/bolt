import { ipcRenderer } from 'electron'

const featureConfigAPI = {
  // Get all feature configurations
  getAllFeatureConfigs: () => ipcRenderer.invoke('feature-config:getAll'),

  // Get feature configuration by key
  getFeatureConfigByKey: (featureKey) => ipcRenderer.invoke('feature-config:getByKey', featureKey),

  // Get feature configurations by type (page or tab)
  getFeatureConfigsByType: (featureType) =>
    ipcRenderer.invoke('feature-config:getByType', featureType),

  // Create or update feature configuration
  upsertFeatureConfig: (config) => ipcRenderer.invoke('feature-config:upsert', config),

  // Update access level for a feature
  updateFeatureConfigAccessLevel: (featureKey, accessLevel) =>
    ipcRenderer.invoke('feature-config:updateAccessLevel', { featureKey, accessLevel }),

  // Update per-role access (role: 'editor' | 'viewer', access: 'edit' | 'view' | 'hidden')
  updateRoleAccess: (featureKey, role, access) =>
    ipcRenderer.invoke('feature-config:updateRoleAccess', { featureKey, role, access }),

  // Delete feature configuration
  deleteFeatureConfig: (featureKey) => ipcRenderer.invoke('feature-config:delete', featureKey),

  // Delete all feature configurations
  deleteAllFeatureConfigs: () => ipcRenderer.invoke('feature-config:deleteAll'),

  // Reset all feature configurations to default
  resetFeatureConfigs: () => ipcRenderer.invoke('feature-config:reset'),

  // Get superadmin only features
  getSuperadminFeatures: () => ipcRenderer.invoke('feature-config:getSuperadminFeatures')
}

export { featureConfigAPI }
