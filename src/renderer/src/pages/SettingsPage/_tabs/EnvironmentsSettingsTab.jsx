import { Button, Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'

const { environmentRepo } = settingsFactory()

const columns = [
  { title: 'Code', dataIndex: 'env_code', key: 'env_code' },
  { title: 'Name', dataIndex: 'env_name', key: 'env_name' },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text) => new Date(text).toLocaleDateString()
  }
]

const EnvironmentsSettingsTabWOC = ({ renderSuccessNotification, renderErrorNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [environments, setEnvironments] = useState([])
  // const { , loading, loadData } = {}

  useEffect(() => {
    setLoading(true)
    loadData()
    setLoading(false)
  }, [])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setIsModalVisible(true)
  }

  const loadData = async () => {
    try {
      const data = await environmentRepo.getAll()
      setEnvironments(data)
      renderSuccessNotification({
        message: 'Environment loaded successfully!'
      })
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const handleDelete = async (item) => {
    try {
      await environmentRepo.delete(item.env_code)
      renderSuccessNotification({
        message: 'Environment deleted successfully!'
      })
      loadData()
    } catch (error) {
      console.error('Error deleting environment:', error)
      renderErrorNotification(error)
    }
  }

  const onFinish = async (values) => {
    try {
      await environmentRepo.upsert(values)
      setIsModalVisible(false)
      setEditingItem(null)
      form.resetFields()
      loadData()
    } catch (error) {
      renderErrorNotification(error)
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
        data={environments}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No environments found. Click 'Add New' to get started."
      />

      <Modal
        title={editingItem ? 'Edit Environment' : 'Add New Environment'}
        open={isModalVisible}
        onOk={onFinish}
        onCancel={handleCancel}
        footer={null}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="env_code"
            label="Environment Code"
            rules={[{ required: true, message: 'Please enter environment code' }]}
          >
            <Input placeholder="e.g., STAGING, PRODUCTION" />
          </Form.Item>
          <Form.Item
            name="env_name"
            label="Environment Name"
            rules={[{ required: true, message: 'Please enter environment name' }]}
          >
            <Input placeholder="e.g., Staging, Production" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
const EnvironmentsSettingsTab = withNotification(EnvironmentsSettingsTabWOC)

export default EnvironmentsSettingsTab
