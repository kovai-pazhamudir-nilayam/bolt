import { useEffect, useState } from 'react'
import { useNotification } from '../../../../context/notificationContext'
import { renderErrorNotification } from '../../../../helpers/error.helper'

export const useDatabaseData = () => {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [environments, setEnvironments] = useState([])
  const [githubUsers, setGithubUsers] = useState([]) // GitHub users
  const [coreTokenConfigs, setCoreTokenConfigs] = useState([])
  const [gcpProjectConfigs, setGcpProjectConfigs] = useState([])
  const [githubConfigs, setGithubConfigs] = useState([])
  const notificationApi = useNotification()

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [companiesData, environmentsData, githubUsersData, coreTokenData, gcpData, githubData] =
        await Promise.all([
          window.api.companies.getAll(),
          window.api.environments.getAll(),
          window.api.githubUsers.getAll(),
          window.api.coreTokenConfigs.getAll(),
          window.api.gcpProjectConfigs.getAll(),
          window.api.githubConfigs.getAll()
        ])

      setCompanies(companiesData || [])
      setEnvironments(environmentsData || [])
      setGithubUsers(githubUsersData || [])
      setCoreTokenConfigs(coreTokenData || [])
      setGcpProjectConfigs(gcpData || [])
      setGithubConfigs(githubData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      renderErrorNotification(
        [
          {
            title: 'Load Failed',
            message: 'Failed to load database data'
          }
        ],
        notificationApi
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  return {
    loading,
    companies,
    environments,
    githubUsers,
    coreTokenConfigs,
    gcpProjectConfigs,
    githubConfigs,
    loadAllData,
    notificationApi
  }
}
