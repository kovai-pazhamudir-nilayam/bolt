import { Form, Input, Modal, Select } from 'antd'
import { useState } from 'react'
import EntityTable from './components/EntityTable'
import { useDatabaseData } from './hooks/useDatabaseData'
import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'
const { Option } = Select

const GitHubConfigsSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { companies, githubConfigs, loading, loadAllData, notificationApi } = useDatabaseData()

  const columns = [
    { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
    {
      title: 'GitHub Token',
      dataIndex: 'github_token',
      key: 'github_token',
      render: (text) => (text ? '***' + text.slice(-4) : '')
    },
    { title: 'Owner', dataIndex: 'owner', key: 'owner' }
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
      await window.api.githubConfigs.delete(item.id)
      renderSuccessNotification(
        {
          message: 'GitHub Config deleted successfully!'
        },
        notificationApi
      )
      loadAllData()
    } catch (error) {
      console.error('Error deleting GitHub config:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to delete GitHub config'
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
        await window.api.githubConfigs.update(
          editingItem.id,
          values.company_id,
          values.github_token,
          values.owner
        )
      } else {
        await window.api.githubConfigs.add(values.company_id, values.github_token, values.owner)
      }

      renderSuccessNotification(
        {
          message: editingItem
            ? 'GitHub Config updated successfully!'
            : 'GitHub Config added successfully!'
        },
        notificationApi
      )

      setIsModalVisible(false)
      form.resetFields()
      loadAllData()
    } catch (error) {
      console.error('Error saving GitHub config:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to save GitHub config'
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
        data={githubConfigs}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No GitHub configs found. Click 'Add New' to get started."
      />

      <Modal
        title={editingItem ? 'Edit GitHub Config' : 'Add New GitHub Config'}
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
            name="github_token"
            label="GitHub Token"
            rules={[{ required: true, message: 'Please enter GitHub token' }]}
          >
            <Input.Password placeholder="ghp_xxxxxxxxxxxx" />
          </Form.Item>
          <Form.Item
            name="owner"
            label="Owner"
            rules={[{ required: true, message: 'Please enter GitHub owner' }]}
          >
            <Input placeholder="organization or username" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default GitHubConfigsSettings
