import { Button, Form, Input, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import SelectFormItem from '../../../components/SelectFormItem'

const { Option } = Select
const { mediaConfigRepo, companyRepo, environmentRepo } = settingsFactory()

const MediaConfigModal = ({ editing, handleCancel, onFinish, form, companies, environments }) => {
  return (
    <Modal
      title={editing ? 'Edit Media Config' : 'Add New Media Config'}
      open={true}
      footer={null}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
        <SelectFormItem
          options={companies}
          name="company_code"
          label="Company"
          transform="COMPANIES"
        />
        <SelectFormItem
          options={environments}
          name="env_code"
          label="Environment"
          transform="ENVIRONMENTS"
        />

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select type' }]}
        >
          <Select placeholder="Select type" disabled={editing}>
            <Option value="PRODUCT">Product</Option>
            <Option value="BRAND">Brand</Option>
            <Option value="CATEGORY">Category</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="bucket_path"
          label="Bucket Path"
          rules={[{ required: true, message: 'Please enter bucket path' }]}
        >
          <Input placeholder="e.g., /media/products/company1" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const columns = [
  { title: 'Company', dataIndex: 'company_code', key: 'company_code' },
  { title: 'Environment', dataIndex: 'env_code', key: 'env_code' },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (text) => text.charAt(0).toUpperCase() + text.slice(1)
  },
  { title: 'Bucket Path', dataIndex: 'bucket_path', key: 'bucket_path' },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text) => new Date(text).toLocaleDateString()
  },
  {
    title: 'Updated',
    dataIndex: 'updated_at',
    key: 'updated_at',
    render: (text) => new Date(text).toLocaleDateString()
  }
]

const MediaConfigSettingsTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [open, setOpen] = useState(false)
  const [mediaConfigs, setMediaConfigs] = useState([])
  const [companies, setCompanies] = useState([])
  const [environments, setEnvironments] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const loadData = async () => {
    try {
      setLoading(true)
      const [mediaConfigsData, companiesData, environmentsData] = await Promise.all([
        mediaConfigRepo.getAll(),
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])
      setMediaConfigs(mediaConfigsData)
      setCompanies(companiesData)
      setEnvironments(environmentsData)
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const handleEdit = (item) => {
    setEditing(item)
    form.setFieldsValue(item)
    setOpen(true)
  }

  const handleDelete = async (item) => {
    try {
      await mediaConfigRepo.delete(item.id)
      loadData()
      renderSuccessNotification({
        message: 'Media Config deleted successfully!'
      })
    } catch (error) {
      renderErrorNotification({ message: error.message })
    }
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
    setEditing(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const onFinish = async (values) => {
    try {
      const data = {
        ...values,
        id: editing?.id
      }
      await mediaConfigRepo.upsert(data)
      setOpen(false)
      setEditing(null)
      form.resetFields()
      loadData()
      renderSuccessNotification({
        message: editing
          ? 'Media Config updated successfully!'
          : 'Media Config created successfully!'
      })
    } catch (error) {
      renderErrorNotification({ message: error.message })
    }
  }

  return (
    <>
      <EntityTable
        rowKey="id"
        data={mediaConfigs}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No media configs found. Click 'Add New' to get started."
      />

      {open && (
        <MediaConfigModal
          editing={editing}
          handleCancel={handleCancel}
          onFinish={onFinish}
          form={form}
          companies={companies}
          environments={environments}
        />
      )}
    </>
  )
}

const MediaConfigSettingsTab = withNotification(MediaConfigSettingsTabWOC)

export default MediaConfigSettingsTab
