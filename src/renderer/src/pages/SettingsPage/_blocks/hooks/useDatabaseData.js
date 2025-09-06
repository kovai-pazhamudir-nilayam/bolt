import { useEffect, useState } from 'react'
import { useNotification } from '../../../../context/notificationContext'
import { renderErrorNotification } from '../../../../helpers/error.helper'

export const useDatabaseData = () => {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [environments, setEnvironments] = useState([])
  const [users, setUsers] = useState([]) // GitHub users
  const [coreTokenConfigs, setCoreTokenConfigs] = useState([])
  const [gcpProjectConfigs, setGcpProjectConfigs] = useState([])
  const [githubConfigs, setGithubConfigs] = useState([])
  const notificationApi = useNotification()

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [companiesData, environmentsData, usersData, coreTokenData, gcpData, githubData] =
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
      setUsers(usersData || [])
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
    users,
    coreTokenConfigs,
    gcpProjectConfigs,
    githubConfigs,
    loadAllData,
    notificationApi
  }
}
