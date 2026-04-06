import { Form, Modal } from 'antd'
import { useEffect, useState } from 'react'
import CompanySelection from '../../../components/CompanySelection'
import EntityTable from '../../../components/EntityTable'
import EnvironmentSelection from '../../../components/EnvironmentSelection'
import InputFormItem from '../../../components/InputFormItem'
import SubmitBtnForm from '../../../components/SubmitBtnForm'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'

const { coreConfigRepo } = settingsFactory()

const columns = [
  { title: 'Company', dataIndex: 'company_code', key: 'company_code' },
  { title: 'Environment', dataIndex: 'env_code', key: 'env_code' },
  { title: 'Core Base URL', dataIndex: 'base_url', key: 'base_url' },
  { title: 'Token API', dataIndex: 'auth_api', key: 'auth_api' },
  {
    title: 'Auth Key',
    dataIndex: 'auth_api_key',
    key: 'auth_api_key',
    render: (text) => (text ? '***' + text.slice(-4) : '')
  }
]

const CoreConfigsSettingsPageTabWOC = ({ renderSuccessNotification, renderErrorNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)

  const [datasource, setDatasource] = useState({
    coreConfigs: []
  })

  async function fetchData() {
    setLoading(true)
    try {
      const [coreConfigs] = await Promise.all([coreConfigRepo.getAll()])

      setDatasource({
        coreConfigs: coreConfigs
      })
    } catch (error) {
      renderErrorNotification({
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalVisible(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsModalVisible(true)
  }

  const handleDelete = async (item) => {
    try {
      await coreConfigRepo.delete(item)
      renderSuccessNotification({
        message: 'Core Token Config deleted successfully!'
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting core token config:', error)
      renderErrorNotification({
        title: 'Delete Failed',
        message: error.message || 'Failed to delete core token config'
      })
    }
  }

  const handleSave = async (values) => {
    try {
      await coreConfigRepo.upsert(values)
      renderSuccessNotification({
        message: editingItem
          ? 'Core Config updated successfully!'
          : 'Core Config added successfully!'
      })

      setIsModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Error saving Core config:', error)
      renderErrorNotification({
        title: 'Save Failed',
        message: error.message || 'Failed to save Core config'
      })
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingItem(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  return (
    <>
      <EntityTable
        data={datasource.coreConfigs}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No Core configs found. Click 'Add New' to get started."
      />

      {isModalVisible && (
        <Modal
          title={editingItem ? 'Edit Core Config' : 'Add New Core Config'}
          open={true}
          footer={null}
          onCancel={handleCancel}
          okText="Save"
          cancelText="Cancel"
          width={600}
        >
          <Form
            initialValues={editingItem}
            onFinish={handleSave}
            layout="vertical"
            requiredMark={false}
          >
            <CompanySelection />
            <EnvironmentSelection />
            <InputFormItem name="base_url" label="Base URL" placeholder="https://api.example.com" />
            <InputFormItem name="auth_api" label="Token API" placeholder="/api/auth/token" />
            <InputFormItem name="auth_api_key" label="Auth Key" placeholder="Authentication key" />
            <SubmitBtnForm loading={loading} />
          </Form>
        </Modal>
      )}
    </>
  )
}

const CoreConfigsSettingsPageTab = withNotification(CoreConfigsSettingsPageTabWOC)

export default CoreConfigsSettingsPageTab
