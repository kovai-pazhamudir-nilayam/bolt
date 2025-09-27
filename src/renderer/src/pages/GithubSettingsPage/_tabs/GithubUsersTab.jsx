/* eslint-disable react/prop-types */
import { Typography } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import withNotification from '../../../hoc/withNotification'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
import AddGitHubUserModal from '../_blocks/AddGitHubUserModal'
const { Text } = Typography

const { githubUsersRepo } = githubSettingsPageFactory()

const githubUsersTabcolumns = [
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

const GithubUsersTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [datasource, setDatasource] = useState({
    githubUsers: []
  })

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalVisible(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsModalVisible(true)
  }

  async function fetchData() {
    try {
      setLoading(true)
      const githubUsers = await githubUsersRepo.getAll()
      setLoading(false)
      setDatasource({
        githubUsers
      })
    } catch (errors) {
      renderErrorNotification(errors)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (item) => {
    try {
      await githubUsersRepo.delete(item.github_handle)
      renderSuccessNotification({
        message: 'GitHub user deleted successfully!'
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting user:', error)
      renderErrorNotification({
        message: error.message || 'Error deleting GitHub user'
      })
    }
  }

  const onFinish = async (values) => {
    try {
      await githubUsersRepo.upsert(values)
      renderSuccessNotification({
        message: editingItem
          ? 'GitHub user updated successfully!'
          : 'GitHub user added successfully!'
      })

      setIsModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Error saving GitHub user:', error)
      renderErrorNotification({
        message: error.message || 'Error saving GitHub user'
      })
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingItem(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  return (
    <>
      <EntityTable
        data={datasource.githubUsers}
        columns={githubUsersTabcolumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No users found. Click 'Add New' to get started."
      />

      {isModalVisible && (
        <AddGitHubUserModal
          handleCancel={handleCancel}
          onFinish={onFinish}
          editingItem={editingItem}
          values={editingItem || {}}
        />
      )}
    </>
  )
}

const GithubUsersTab = withNotification(GithubUsersTabWOC)

export default GithubUsersTab
