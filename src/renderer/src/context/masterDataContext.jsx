import { createContext, useContext, useState, useEffect } from 'react'

export const MasterDataContext = createContext({
  brand: null,
  environment: null,
  configs: {},
  brands: [],
  environments: [],
  setMasterData: () => {},
  loadConfigs: () => {},
  refreshBrands: () => {},
  refreshEnvironments: () => {}
})

export const useMasterDataContext = () => useContext(MasterDataContext)

export const MasterDataProvider = ({ children }) => {
  const [masterData, setMasterData] = useState({ 
    brand: null, 
    environment: null, 
    configs: {},
    brands: [],
    environments: []
  })

  // Load available brands on mount
  const refreshBrands = async () => {
    try {
      const brands = await window.api.config.getBrands()
      setMasterData(prev => ({ ...prev, brands }))
    } catch (error) {
      console.error('Failed to load brands:', error)
    }
  }

  // Load environments for current brand
  const refreshEnvironments = async (brand) => {
    if (!brand) {
      setMasterData(prev => ({ ...prev, environments: [] }))
      return
    }
    
    try {
      const environments = await window.api.config.getEnvironments(brand)
      setMasterData(prev => ({ ...prev, environments }))
    } catch (error) {
      console.error('Failed to load environments:', error)
    }
  }

  // Load configurations for current brand and environment
  const loadConfigs = async (brand, environment) => {
    if (!brand || !environment) {
      setMasterData(prev => ({ ...prev, configs: {} }))
      return
    }

    try {
      const configs = await window.api.config.getAll(brand, environment)
      setMasterData(prev => ({ ...prev, configs }))
    } catch (error) {
      console.error('Failed to load configs:', error)
    }
  }

  // Enhanced setMasterData that also loads configs
  const setMasterDataWithConfigs = async (newData) => {
    setMasterData(prev => ({ ...prev, ...newData }))
    
    // If brand changed, refresh environments
    if (newData.brand !== undefined) {
      await refreshEnvironments(newData.brand)
    }
    
    // If brand or environment changed, load configs
    const finalBrand = newData.brand !== undefined ? newData.brand : masterData.brand
    const finalEnvironment = newData.environment !== undefined ? newData.environment : masterData.environment
    
    if (finalBrand && finalEnvironment) {
      await loadConfigs(finalBrand, finalEnvironment)
    }
  }

  // Load brands on mount
  useEffect(() => {
    refreshBrands()
  }, [])

  return (
    <MasterDataContext.Provider value={{ 
      ...masterData, 
      setMasterData: setMasterDataWithConfigs,
      loadConfigs,
      refreshBrands,
      refreshEnvironments
    }}>
      {children}
    </MasterDataContext.Provider>
  )
}
