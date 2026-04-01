import { Form } from 'antd'
import { useEffect, useState } from 'react'
import withNotification from '../hoc/withNotification'
import { dbSecretsFactory } from '../repos/DBSecretsPage.repo'
import SelectFormItem from './SelectFormItem'

const { dbSecretsRepo } = dbSecretsFactory()

const DBSelectionWOC = ({ renderErrorNotification, name = 'db_name' }) => {
  const [allDbSecrets, setAllDbSecrets] = useState([])
  const [options, setOptions] = useState([])

  const selectedCompany = Form.useWatch('company_code')

  useEffect(() => {
    dbSecretsRepo.getAll().then(setAllDbSecrets).catch(renderErrorNotification)
  }, [])

  useEffect(() => {
    const dbs = [
      ...new Set(
        allDbSecrets.filter((s) => s.company_code === selectedCompany).map((s) => s.db_name)
      )
    ]
    setOptions(dbs.map((d) => ({ label: d, value: d })))
  }, [selectedCompany, allDbSecrets])

  return (
    <SelectFormItem
      options={options}
      name={name}
      label="Database"
    />
  )
}

const DBSelection = withNotification(DBSelectionWOC)

export default DBSelection
