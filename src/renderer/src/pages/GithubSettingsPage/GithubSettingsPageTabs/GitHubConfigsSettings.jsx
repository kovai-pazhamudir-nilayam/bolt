import { Button, Form, Input, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'
import { githubConfigsFactory } from '../../../repos/githubConfigs.repo'
import useNotification from 'antd/es/notification/useNotification'
import GitHubConfigsModal from '../_blocks/GitHubConfigsModal'
const { Option } = Select

const { githubConfigsRepo } = githubConfigsFactory()

const GitHubConfigsSettings = () => {
  const notificationApi = useNotification()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [githubConfigsData, setGithubConfigsData] = useState([])

  const columns = [
    { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
    { title: 'Company Code', dataIndex: 'company_code', key: 'company_code' },
    {
      title: 'GitHub Token',
      dataIndex: 'github_token',
      key: 'github_token',
      render: (text) => (text ? '***' + text.slice(-4) : '')
    },
    { title: 'Owner', dataIndex: 'owner', key: 'owner' }
  ]

  async function fetchData() {
    try {
      setLoading(true)
      const data = await githubConfigsRepo.getGitHubConfig()
      setGithubConfigsData(data)
      renderSuccessNotification({ message: 'Access removed' }, notificationApi)
    } catch (errors) {
      renderErrorNotification(errors)
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
      fetchData()
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

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await window.api.githubConfigs.update(
          editingItem.id,
          values.company_id,
          values.github_token,
          values.owner
        )
      } else {
        await githubConfigsRepo.addGithubConfig(values)
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
      fetchData()
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
        rowKey="github_config_id"
        data={githubConfigsData}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No GitHub configs found. Click 'Add New' to get started."
      />

      {isModalVisible && (
        <GitHubConfigsModal
          editingItem={editingItem}
          handleCancel={handleCancel}
          handleSave={handleSave}
          // companies={companies }
          companies={[]}
        />
      )}
    </>
  )
}

export default GitHubConfigsSettings
