import { Form, Input, Modal } from 'antd'
import { useState } from 'react'
import EntityTable from './components/EntityTable'
import { useDatabaseData } from './hooks/useDatabaseData'
import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'

const CompaniesSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { companies, loading, loadAllData, notificationApi } = useDatabaseData()

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Logo', dataIndex: 'logo', key: 'logo', render: (text) => text || 'No logo' },
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
      await window.api.companies.delete(item.id)
      renderSuccessNotification(
        {
          message: 'Company deleted successfully!'
        },
        notificationApi
      )
      loadAllData()
    } catch (error) {
      console.error('Error deleting company:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to delete company'
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
        await window.api.companies.update(editingItem.id, values.code, values.name, values.logo)
      } else {
        await window.api.companies.add(values.code, values.name, values.logo)
      }

      renderSuccessNotification(
        {
          message: editingItem ? 'Company updated successfully!' : 'Company added successfully!'
        },
        notificationApi
      )

      setIsModalVisible(false)
      form.resetFields()
      loadAllData()
    } catch (error) {
      console.error('Error saving company:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to save company'
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
        data={companies}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No companies found. Click 'Add New' to get started."
      />

      <Modal
        title={editingItem ? 'Edit Company' : 'Add New Company'}
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
            label="Company Code"
            rules={[{ required: true, message: 'Please enter company code' }]}
          >
            <Input placeholder="e.g., KPN, IBO" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="e.g., Kovai Pazhamudir Nilayam" />
          </Form.Item>
          <Form.Item name="logo" label="Logo URL">
            <Input placeholder="Optional logo URL" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default CompaniesSettings
