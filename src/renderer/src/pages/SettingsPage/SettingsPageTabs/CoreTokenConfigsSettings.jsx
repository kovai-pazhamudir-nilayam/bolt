import { Form, Input, Modal, Select } from 'antd'
import { useState } from 'react'
import EntityTable from './components/EntityTable'
import { useDatabaseData } from './hooks/useDatabaseData'
import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'

const { Option } = Select

const CoreTokenConfigsSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { companies, environments, coreTokenConfigs, loading, loadAllData, notificationApi } =
    useDatabaseData()

  const columns = [
    { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
    { title: 'Environment', dataIndex: 'environment_name', key: 'environment_name' },
    { title: 'Domain', dataIndex: 'domain', key: 'domain' },
    { title: 'Token API', dataIndex: 'token_api', key: 'token_api' },
    {
      title: 'Auth Key',
      dataIndex: 'auth_key',
      key: 'auth_key',
      render: (text) => (text ? '***' + text.slice(-4) : '')
    }
  ]

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

  const handleDelete = async (item) => {
    try {
      await window.api.coreTokenConfigs.delete(item.id)
      renderSuccessNotification(
        {
          message: 'Core Token Config deleted successfully!'
        },
        notificationApi
      )
      loadAllData()
    } catch (error) {
      console.error('Error deleting core token config:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to delete core token config'
          }
        ],
        notificationApi
      )
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      if (editingItem) {
        await window.api.coreTokenConfigs.update(
          editingItem.id,
          values.company_id,
          values.environment_id,
          values.domain,
          values.token_api,
          values.auth_key
        )
      } else {
        await window.api.coreTokenConfigs.add(
          values.company_id,
          values.environment_id,
          values.domain,
          values.token_api,
          values.auth_key
        )
      }

      renderSuccessNotification(
        {
          message: editingItem
            ? 'Core Token Config updated successfully!'
            : 'Core Token Config added successfully!'
        },
        notificationApi
      )

      setIsModalVisible(false)
      form.resetFields()
      loadAllData()
    } catch (error) {
      console.error('Error saving core token config:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to save core token config'
          }
        ],
        notificationApi
      )
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
        data={coreTokenConfigs}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No core token configs found. Click 'Add New' to get started."
      />

      <Modal
        title={editingItem ? 'Edit Core Token Config' : 'Add New Core Token Config'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="company_id"
            label="Company"
            rules={[{ required: true, message: 'Please select company' }]}
          >
            <Select placeholder="Select company">
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="environment_id"
            label="Environment"
            rules={[{ required: true, message: 'Please select environment' }]}
          >
            <Select placeholder="Select environment">
              {environments.map((env) => (
                <Option key={env.id} value={env.id}>
                  {env.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="domain"
            label="Domain"
            rules={[{ required: true, message: 'Please enter domain' }]}
          >
            <Input placeholder="https://api.example.com" />
          </Form.Item>
          <Form.Item
            name="token_api"
            label="Token API"
            rules={[{ required: true, message: 'Please enter token API path' }]}
          >
            <Input placeholder="/api/auth/token" />
          </Form.Item>
          <Form.Item
            name="auth_key"
            label="Auth Key"
            rules={[{ required: true, message: 'Please enter auth key' }]}
          >
            <Input placeholder="Authentication key" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default CoreTokenConfigsSettings
