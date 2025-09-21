import { Button, Form, Input, Modal, Typography } from 'antd'
import { useEffect, useState } from 'react'
import withNotification from '../../../hoc/withNotification'
import EntityTable from '../../../components/EntityTable'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
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
  const [form] = Form.useForm()
  const [datasource, setDatasource] = useState({
    githubUsers: []
  })

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
      await window.api.githubUsers.delete(item.id)
      renderSuccessNotification({
        message: 'GitHub user deleted successfully!'
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting user:', error)
      renderErrorNotification(error)
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
      form.resetFields()
      fetchData()
    } catch (error) {
      console.error('Error saving GitHub user:', error)
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
        <Modal
          title={editingItem ? 'Edit GitHub User' : 'Add New GitHub User'}
          open={true}
          onCancel={handleCancel}
          okText="Save"
          cancelText="Cancel"
          width={600}
          footer={null}
        >
          <Form onFinish={onFinish} form={form} layout="vertical" requiredMark={false}>
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
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  )
}

const GithubUsersTab = withNotification(GithubUsersTabWOC)

export default GithubUsersTab
