import { UserOutlined } from '@ant-design/icons'
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography
} from 'antd'
import { UserPlus, Trash, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../../../components/PageHeader/PageHeader'

const { Text } = Typography

const githubUserTableColumns = ({ handleEditUser, handleDeleteUser }) => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
        </Space>
      )
    },
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
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Row gutter={[8, 8]}>
          <Col>
            <Button type="primary" size="small" onClick={() => handleEditUser(record)}>
              <Pencil size={16} /> Edit
            </Button>
          </Col>
          <Col>
            <Popconfirm
              title="Are you sure?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDeleteUser(record)}
            >
              <Button danger type="primary" size="small">
                <Trash size={16} /> Delete
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      )
    }
  ]
  return columns
}

const GitHubUserSettings = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  // Load users from database
  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await window.api.users.getAll()
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error loading users:', error)
      message.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAddUser = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    form.setFieldsValue({
      name: user.name,
      github_handle: user.github_handle
    })
    setIsModalVisible(true)
  }

  const handleDeleteUser = async (user) => {
    try {
      await window.api.users.delete(user.id)
      message.success('User deleted successfully!')
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      message.error('Failed to delete user')
    }
  }

  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields()

      if (editingUser) {
        // Update existing user
        await window.api.users.update(editingUser.id, values.name, values.github_handle)
        message.success('User updated successfully!')
      } else {
        // Add new user
        await window.api.users.add(values.name, values.github_handle)
        message.success('User added successfully!')
      }

      setIsModalVisible(false)
      form.resetFields()
      loadUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        message.error('GitHub handle already exists')
      } else {
        message.error('Failed to save user')
      }
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingUser(null)
  }

  return (
    <div>
      <PageHeader
        title="GitHub User Management"
        description="Manage GitHub users who have access to the system."
      />

      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify={'end'}>
          <Col>
            <Button type="primary" icon={<UserPlus size={16} />} onClick={handleAddUser}>
              Add New User
            </Button>
          </Col>
        </Row>
        <Table
          columns={githubUserTableColumns({ handleEditUser, handleDeleteUser })}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
          }}
          locale={{
            emptyText: 'No users found. Click "Add New User" to get started.'
          }}
        />

        <Modal
          title={editingUser ? 'Edit User' : 'Add New User'}
          open={isModalVisible}
          onOk={handleSaveUser}
          onCancel={handleCancel}
          okText="Save"
          cancelText="Cancel"
          width={500}
        >
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: 'Please enter the user name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="Enter user's full name" />
            </Form.Item>

            <Form.Item
              name="github_handle"
              label="GitHub Handle"
              rules={[
                { required: true, message: 'Please enter the GitHub handle' },
                {
                  pattern: /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
                  message: 'Please enter a valid GitHub handle'
                }
              ]}
            >
              <Input placeholder="Enter GitHub handle (without @)" addonBefore="@" />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </div>
  )
}

export default GitHubUserSettings
