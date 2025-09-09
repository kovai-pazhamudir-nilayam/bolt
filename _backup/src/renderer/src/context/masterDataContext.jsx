import { createContext, useContext, useState, useEffect } from 'react'

export const MasterDataContext = createContext({
  companyCode: null,
  environmentCode: null,
  configs: {},
  companies: [],
  environments: [],
  setMasterData: () => {},
  loadConfigs: () => {},
  refreshCompanies: () => {},
  refreshEnvironments: () => {}
})

export const useMasterDataContext = () => useContext(MasterDataContext)

export const MasterDataProvider = ({ children }) => {
  const [masterData, setMasterData] = useState({
    companyCode: null,
    environmentCode: null,
    configs: {},
    companies: [],
    environments: []
  })

  // Load available companies
  const refreshCompanies = async () => {
    try {
      const companies = await window.api.companies.getAll()
      setMasterData((prev) => ({ ...prev, companies }))
    } catch (error) {
      console.error('Failed to load companies:', error)
    }
  }

  // Load environments (global list)
  const refreshEnvironments = async () => {
    try {
      const environments = await window.api.environments.getAll()
      setMasterData((prev) => ({ ...prev, environments }))
    } catch (error) {
      console.error('Failed to load environments:', error)
    }
  }

  // Load normalized configurations for current company and environment
  const loadConfigs = async (companyCode, environmentCode) => {
    if (!companyCode || !environmentCode) {
      setMasterData((prev) => ({ ...prev, configs: {} }))
      return
    }

    try {
      const [allCoreTokens, allGcpConfigs, allGithubConfigs] = await Promise.all([
        window.api.coreTokenConfigs.getAll(),
        window.api.gcpProjectConfigs.getAll(),
        window.api.githubConfigs.getAll()
      ])

      const coreToken = allCoreTokens.find(
        (c) => c.company_code === companyCode && c.environment_code === environmentCode
      )
      const gcpProject = allGcpConfigs.find(
        (g) => g.company_code === companyCode && g.environment_code === environmentCode
      )
      const github = allGithubConfigs.find((g) => g.company_code === companyCode)

      const configs = {
        CORE_TOKEN_CONFIG: coreToken || null,
        GCP_PROJECT_CONFIG: gcpProject || null,
        GITHUB_CONFIG: github || null
      }

      setMasterData((prev) => ({ ...prev, configs }))
    } catch (error) {
      console.error('Failed to load configs:', error)
    }
  }

  // Enhanced setMasterData that also loads configs
  const setMasterDataWithConfigs = async (newData) => {
    setMasterData((prev) => ({ ...prev, ...newData }))

    // If company or environment changed, load configs
    const finalCompanyCode =
      newData.companyCode !== undefined ? newData.companyCode : masterData.companyCode
    const finalEnvironmentCode =
      newData.environmentCode !== undefined ? newData.environmentCode : masterData.environmentCode

    if (finalCompanyCode && finalEnvironmentCode) {
      await loadConfigs(finalCompanyCode, finalEnvironmentCode)
    }
  }

  // Load companies and environments on mount
  useEffect(() => {
    refreshCompanies()
    refreshEnvironments()
  }, [])

  return (
    <MasterDataContext.Provider
      value={{
        ...masterData,
        setMasterData: setMasterDataWithConfigs,
        loadConfigs,
        refreshCompanies,
        refreshEnvironments
      }}
    >
      {children}
    </MasterDataContext.Provider>
  )
}
