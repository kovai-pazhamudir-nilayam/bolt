import { useEffect, useState } from 'react'
import SelectFormItem from './SelectFormItem'
import withNotification from '../hoc/withNotification'
import { settingsFactory } from '../repos/SettingsPage.repo'
const { environmentRepo } = settingsFactory()

const EnvironmentSelectionWOC = ({ renderErrorNotification, name = 'env_code' }) => {
  // const [loading, setLoading] = useState(false)
  const [datasource, setDatasource] = useState({
    environments: []
  })

  const fetchData = async () => {
    // setLoading(true)
    try {
      const [environments] = await Promise.all([environmentRepo.getAll()])

      setDatasource({
        environments: environments
      })
    } catch (error) {
      renderErrorNotification(error)
    } finally {
      // setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <SelectFormItem
      options={datasource.environments}
      name={name}
      label="Environment"
      transform="ENVIRONMENTS"
    />
  )
}

const EnvironmentSelection = withNotification(EnvironmentSelectionWOC)

export default EnvironmentSelection
