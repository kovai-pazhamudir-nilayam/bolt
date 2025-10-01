/* eslint-disable react/prop-types */
import { Form, Modal } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import InputFormItem from '../../../components/InputFormItem'
import SelectFormItem from '../../../components/SelectFormItem'
import SubmitBtnForm from '../../../components/SubmitBtnForm'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'

const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()

const gcpProjectConfigTableColumns = [
  { title: 'Company', dataIndex: 'company_code', key: 'company_code' },
  { title: 'Environment', dataIndex: 'env_code', key: 'env_code' },
  { title: 'GCP Project', dataIndex: 'gcp_project', key: 'gcp_project' },
  { title: 'GCP Cluster', dataIndex: 'gcp_cluster', key: 'gcp_cluster' },
  { title: 'GCP Region', dataIndex: 'gcp_region', key: 'gcp_region' },
  {
    title: 'Redis Config?',
    render: (item) => {
      return item?.redis_host ? 'Yes' : 'No'
    }
  }
]

const GcpProjectConfigsSettingsTabWOC = ({
  renderErrorNotification,
  renderSuccessNotification
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: [],
    gcpProjectConfigs: []
  })

  async function fetchData() {
    setLoading(true)
    try {
      const [allCompanies, allEnvironments, allGcpProjectConfigRepo] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll(),
        gcpProjectConfigRepo.getAll()
      ])

      setDatasource({
        companies: allCompanies,
        environments: allEnvironments,
        gcpProjectConfigs: allGcpProjectConfigRepo
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
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsModalVisible(true)
  }

  const handleDelete = async (value) => {
    try {
      await gcpProjectConfigRepo.delete(value)
      renderSuccessNotification({
        message: 'GCP Project Config deleted successfully!'
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting GCP project config:', error)
      renderErrorNotification({
        title: 'Delete Failed',
        message: error.message || 'Failed to delete GCP project config'
      })
    }
  }

  const handleSave = async (values) => {
    try {
      await gcpProjectConfigRepo.upsert(values)

      renderSuccessNotification({
        message: editingItem
          ? 'GCP Project Config updated successfully!'
          : 'GCP Project Config added successfully!'
      })

      setIsModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      console.error('Error saving GCP Project Config:', error)
      renderErrorNotification({
        message: 'Error',
        description: error.message
      })
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingItem(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  return (
    <>
      <EntityTable
        data={datasource.gcpProjectConfigs}
        columns={gcpProjectConfigTableColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No GCP project configs found. Click 'Add New' to get started."
      />

      {isModalVisible && (
        <Modal
          title={editingItem ? 'Edit GCP Project Config' : 'Add New GCP Project Config'}
          open={true}
          onCancel={handleCancel}
          okText="Save"
          cancelText="Cancel"
          width={600}
          footer={null}
        >
          <Form
            initialValues={editingItem}
            form={form}
            onFinish={handleSave}
            layout="vertical"
            requiredMark={false}
          >
            <SelectFormItem
              disabled={editingItem}
              options={datasource.companies}
              name="company_code"
              label="Company"
              transform={'COMPANIES'}
            />
            <SelectFormItem
              disabled={editingItem}
              options={datasource.environments}
              name="env_code"
              label="Environment"
              transform={'ENVIRONMENTS'}
            />

            <InputFormItem name="gcp_project" label="GCP Project" />
            <InputFormItem name="gcp_cluster" label="GCP Cluster" />
            <InputFormItem name="gcp_region" label="GCP Region" />
            <InputFormItem isOptional={true} name="redis_host" label="Redis Host (Optional)" />
            <InputFormItem
              isOptional={true}
              name="redis_password"
              label="Redis Password (Optional)"
            />
            <SubmitBtnForm />
          </Form>
        </Modal>
      )}
    </>
  )
}

const GcpProjectConfigsSettingsTab = withNotification(GcpProjectConfigsSettingsTabWOC)

export default GcpProjectConfigsSettingsTab
