import { useEffect, useState } from 'react'
import SelectFormItem from './SelectFormItem'
import withNotification from '../hoc/withNotification'
import { settingsFactory } from '../repos/SettingsPage.repo'
const { companyRepo } = settingsFactory()

const CompanySelectionWOC = ({ renderErrorNotification }) => {
  // const [loading, setLoading] = useState(false)
  const [datasource, setDatasource] = useState({
    companies: []
  })

  const fetchData = async () => {
    // setLoading(true)
    try {
      const [allCompanies] = await Promise.all([companyRepo.getAll()])

      setDatasource({
        companies: allCompanies
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
      options={datasource.companies}
      name="company_code"
      label="Company"
      transform="COMPANIES"
    />
  )
}

const CompanySelection = withNotification(CompanySelectionWOC)

export default CompanySelection
