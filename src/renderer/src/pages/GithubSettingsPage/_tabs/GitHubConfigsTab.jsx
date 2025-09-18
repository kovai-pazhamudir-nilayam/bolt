/* eslint-disable react/prop-types */
import { Form } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import withNotification from '../../../hoc/withNotification'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
import GitHubConfigsModal from '../_blocks/GitHubConfigsModal'

const { githubConfigsRepo } = githubSettingsPageFactory()

const GitHubConfigsTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [githubConfigsData, setGithubConfigsData] = useState([])

  const columns = [
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
      const data = await githubConfigsRepo.getAll()
      setGithubConfigsData(data)
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
      renderSuccessNotification({
        message: 'GitHub Config deleted successfully!'
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting GitHub config:', error)
      renderErrorNotification({
        title: 'Delete Failed',
        message: error.message || 'Failed to delete GitHub config'
      })
    }
  }

  const handleSave = async (values) => {
    try {
      await githubConfigsRepo.upsert(values)

      renderSuccessNotification({
        message: editingItem
          ? 'GitHub Config updated successfully!'
          : 'GitHub Config added successfully!'
      })

      setIsModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      console.error('Error saving GitHub config:', error)
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

const GitHubConfigsTab = withNotification(GitHubConfigsTabWOC)
export default GitHubConfigsTab
