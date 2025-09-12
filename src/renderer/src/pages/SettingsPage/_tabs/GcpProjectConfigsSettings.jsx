import { Form, Input, Modal, Select } from 'antd'
import { useState } from 'react'
import EntityTable from './components/EntityTable'
import { useDatabaseData } from './hooks/useDatabaseData'
import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'
const { Option } = Select

const GcpProjectConfigsSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { companies, environments, gcpProjectConfigs, loading, loadAllData, notificationApi } =
    useDatabaseData()

  const columns = [
    { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
    { title: 'Environment', dataIndex: 'environment_name', key: 'environment_name' },
    { title: 'GCP Project', dataIndex: 'gcp_project', key: 'gcp_project' },
    { title: 'GCP Cluster', dataIndex: 'gcp_cluster', key: 'gcp_cluster' },
    { title: 'GCP Region', dataIndex: 'gcp_region', key: 'gcp_region' }
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
      await window.api.gcpProjectConfigs.delete(item.id)
      renderSuccessNotification(
        {
          message: 'GCP Project Config deleted successfully!'
        },
        notificationApi
      )
      loadAllData()
    } catch (error) {
      console.error('Error deleting GCP project config:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to delete GCP project config'
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
        await window.api.gcpProjectConfigs.update(
          editingItem.id,
          values.company_id,
          values.environment_id,
          values.gcp_project,
          values.gcp_cluster,
          values.gcp_region
        )
      } else {
        await window.api.gcpProjectConfigs.add(
          values.company_id,
          values.environment_id,
          values.gcp_project,
          values.gcp_cluster,
          values.gcp_region
        )
      }

      renderSuccessNotification(
        {
          message: editingItem
            ? 'GCP Project Config updated successfully!'
            : 'GCP Project Config added successfully!'
        },
        notificationApi
      )

      setIsModalVisible(false)
      form.resetFields()
      loadAllData()
    } catch (error) {
      console.error('Error saving GCP project config:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to save GCP project config'
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
        data={gcpProjectConfigs}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No GCP project configs found. Click 'Add New' to get started."
      />

      <Modal
        title={editingItem ? 'Edit GCP Project Config' : 'Add New GCP Project Config'}
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
            name="gcp_project"
            label="GCP Project"
            rules={[{ required: true, message: 'Please enter GCP project' }]}
          >
            <Input placeholder="my-gcp-project" />
          </Form.Item>
          <Form.Item
            name="gcp_cluster"
            label="GCP Cluster"
            rules={[{ required: true, message: 'Please enter GCP cluster' }]}
          >
            <Input placeholder="my-gke-cluster" />
          </Form.Item>
          <Form.Item
            name="gcp_region"
            label="GCP Region"
            rules={[{ required: true, message: 'Please enter GCP region' }]}
          >
            <Input placeholder="us-central1" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default GcpProjectConfigsSettings
