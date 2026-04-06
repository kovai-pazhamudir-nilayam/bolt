// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useContext, useState, useEffect } from 'react'

const FeatureConfigContext = createContext()

export const useFeatureConfig = () => {
  const context = useContext(FeatureConfigContext)
  if (!context) {
    throw new Error('useFeatureConfig must be used within a FeatureConfigProvider')
  }
  return context
}

export const FeatureConfigProvider = ({ children }) => {
  const [featureConfigs, setFeatureConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSuperadmin] = useState(false)
  const [superadminMode, setSuperadminMode] = useState(false)

  // Load all feature configurations
  const loadFeatureConfigs = async () => {
    try {
      setLoading(true)
      const configs = await window.featureConfigAPI.getAllFeatureConfigs()
      setFeatureConfigs(configs)
    } catch (error) {
      console.error('Error loading feature configs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if user has access to a feature
  const hasFeatureAccess = (featureKey, requiredLevel = 'read') => {
    const config = featureConfigs.find((fc) => fc.feature_key === featureKey)
    if (!config) return false

    // Superadmin mode overrides all restrictions
    if (superadminMode) return true

    // Check if feature is hidden
    if (config.access_level === 'hidden') return false

    // Check access level hierarchy: write > read > hidden
    const levelHierarchy = { hidden: 0, read: 1, write: 2 }
    const userLevel = levelHierarchy[config.access_level] || 0
    const requiredLevelValue = levelHierarchy[requiredLevel] || 1

    return userLevel >= requiredLevelValue
  }

  // Check if feature is hidden
  const isFeatureHidden = (featureKey) => {
    const config = featureConfigs.find((fc) => fc.feature_key === featureKey)
    return config ? config.access_level === 'hidden' : false
  }

  // Check if feature is read-only
  const isFeatureReadOnly = (featureKey) => {
    const config = featureConfigs.find((fc) => fc.feature_key === featureKey)
    return config ? config.access_level === 'read' : false
  }

  // Update feature access level
  const updateFeatureAccessLevel = async (featureKey, accessLevel) => {
    try {
      await window.featureConfigAPI.updateFeatureConfigAccessLevel(featureKey, accessLevel)
      await loadFeatureConfigs() // Reload to get updated data
    } catch (error) {
      console.error('Error updating feature access level:', error)
      throw error
    }
  }

  // Reset all feature configurations
  const resetFeatureConfigs = async () => {
    try {
      await window.featureConfigAPI.resetFeatureConfigs()
      await loadFeatureConfigs() // Reload to get updated data
    } catch (error) {
      console.error('Error resetting feature configs:', error)
      throw error
    }
  }

  // Toggle superadmin mode
  const toggleSuperadminMode = () => {
    setSuperadminMode(!superadminMode)
  }

  // Check if feature is superadmin only
  const isSuperadminOnlyFeature = (featureKey) => {
    const config = featureConfigs.find((fc) => fc.feature_key === featureKey)
    return config ? config.is_superadmin_only : false
  }

  // Get filtered routes based on feature access
  const getFilteredRoutes = (routes) => {
    return routes.filter((route) => {
      // Always show routes with hideInMenu: true (they're accessed programmatically)
      if (route.hideInMenu) return true

      // Check if route should be hidden
      return !isFeatureHidden(route.path.replace('/', ''))
    })
  }

  // Load feature configs on mount
  useEffect(() => {
    loadFeatureConfigs()
  }, [])

  const value = {
    featureConfigs,
    loading,
    isSuperadmin,
    superadminMode,
    hasFeatureAccess,
    isFeatureHidden,
    isFeatureReadOnly,
    updateFeatureAccessLevel,
    resetFeatureConfigs,
    toggleSuperadminMode,
    isSuperadminOnlyFeature,
    getFilteredRoutes,
    loadFeatureConfigs
  }

  return <FeatureConfigContext.Provider value={value}>{children}</FeatureConfigContext.Provider>
}
