import { Form, Input, Modal, Typography } from 'antd'
import { useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import { useDatabaseData } from './../_blocks/hooks/useDatabaseData'
import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'
const { Text } = Typography

const GithubUsersSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { githubUsers, loading, loadAllData, notificationApi } = useDatabaseData()

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'GitHub Handle',
      dataIndex: 'github_handle',
      key: 'github_handle',
      render: (text) => <Text code>@{text}</Text>
    },
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
      await window.api.githubUsers.delete(item.id)
      renderSuccessNotification(
        {
          message: 'GitHub user deleted successfully!'
        },
        notificationApi
      )
      loadAllData()
    } catch (error) {
      console.error('Error deleting user:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to delete GitHub user'
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
        await window.api.githubUsers.update(editingItem.id, values.name, values.github_handle)
      } else {
        await window.api.githubUsers.add(values.name, values.github_handle)
      }

      renderSuccessNotification(
        {
          message: editingItem
            ? 'GitHub user updated successfully!'
            : 'GitHub user added successfully!'
        },
        notificationApi
      )

      setIsModalVisible(false)
      form.resetFields()
      loadAllData()
    } catch (error) {
      console.error('Error saving GitHub user:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to save GitHub user'
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
        data={githubUsers}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No users found. Click 'Add New' to get started."
      />

      <Modal
        title={editingItem ? 'Edit GitHub User' : 'Add New GitHub User'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="User's full name" />
          </Form.Item>
          <Form.Item
            name="github_handle"
            label="GitHub Handle"
            rules={[{ required: true, message: 'Please enter GitHub handle' }]}
          >
            <Input placeholder="GitHub username" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default GithubUsersSettings
