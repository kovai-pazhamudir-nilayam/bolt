import { Form, Input, Modal } from 'antd'
import { useState } from 'react'
import EntityTable from './components/EntityTable'
import { useDatabaseData } from './hooks/useDatabaseData'

import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'

const EnvironmentsSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { environments, loading, loadAllData, notificationApi } = useDatabaseData()

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleDateString()
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
      await window.api.environments.delete(item.id)
      renderSuccessNotification(
        {
          message: 'Environment deleted successfully!'
        },
        notificationApi
      )
      loadAllData()
    } catch (error) {
      console.error('Error deleting environment:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to delete environment'
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
        await window.api.environments.update(editingItem.id, values.code, values.name)
      } else {
        await window.api.environments.add(values.code, values.name)
      }

      renderSuccessNotification(
        {
          message: editingItem
            ? 'Environment updated successfully!'
            : 'Environment added successfully!'
        },
        notificationApi
      )

      setIsModalVisible(false)
      form.resetFields()
      loadAllData()
    } catch (error) {
      console.error('Error saving environment:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to save environment'
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
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="code"
            label="Environment Code"
            rules={[{ required: true, message: 'Please enter environment code' }]}
          >
            <Input placeholder="e.g., STAGING, PRODUCTION" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Environment Name"
            rules={[{ required: true, message: 'Please enter environment name' }]}
          >
            <Input placeholder="e.g., Staging, Production" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default EnvironmentsSettings
