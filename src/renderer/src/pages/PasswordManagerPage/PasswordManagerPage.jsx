import { Button, Form, Input, Modal, Select, Tag, Tooltip } from 'antd'
import { Copy, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import EntityTable from '../../components/EntityTable'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'

const { passwordManagerRepo } = settingsFactory()

const PasswordManagerModal = ({ editing, handleCancel, onFinish, form }) => {
  return (
    <Modal
      title={editing ? 'Edit Password Entry' : 'Add New Password Entry'}
      open={true}
      footer={null}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="e.g., Gmail, GitHub, Company Portal" />
        </Form.Item>

        <Form.Item
          name="company_url"
          label="URL"
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                try {
                  new URL(value)
                  return Promise.resolve()
                } catch {
                  return Promise.reject('Invalid URL format')
                }
              }
            }
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select a type' }]}
        >
          <Select placeholder="Select type">
            <Select.Option value="Personal">Personal</Select.Option>
            <Select.Option value="Official">Official</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please enter username' }]}
        >
          <Input placeholder="Enter username or email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter password' }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea placeholder="Additional notes (optional)" rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const PasswordManagerPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [open, setOpen] = useState(false)
  const [passwordEntries, setPasswordEntries] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [showPasswords, setShowPasswords] = useState({})

  const loadData = async () => {
    const data = await passwordManagerRepo.getAll()
    setPasswordEntries(data)
  }

  useEffect(() => {
    setLoading(true)
    loadData()
    setLoading(false)
  }, [])

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const handleEdit = (item) => {
    setEditing(item)
    form.setFieldsValue(item)
    setOpen(true)
  }

  const handleDelete = async (item) => {
    try {
      await passwordManagerRepo.delete(item.id)
      loadData()
      renderSuccessNotification({
        message: 'Password entry deleted successfully!'
      })
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
    setEditing(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const onFinish = async (values) => {
    try {
      if (editing) {
        await passwordManagerRepo.update({ ...values, id: editing.id })
      } else {
        await passwordManagerRepo.create(values)
      }
      setOpen(false)
      setEditing(null)
      form.resetFields()
      loadData()
      renderSuccessNotification({
        message: `Password entry ${editing ? 'updated' : 'created'} successfully!`
      })
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      renderSuccessNotification({
        message: `${type} copied to clipboard!`
      })
    } catch (error) {
      renderErrorNotification({
        message: 'Failed to copy to clipboard'
      })
    }
  }

  const openExternalUrl = (url) => {
    if (url) {
      window.shellAPI.openExternal(url)
    }
  }

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text || 'Untitled'
    },
    {
      title: 'URL',
      dataIndex: 'company_url',
      key: 'company_url',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text || 'No URL'}
          </span>
          {text && (
            <Tooltip title="Open in browser">
              <Button
                type="text"
                size="small"
                icon={<ExternalLink size={14} />}
                onClick={() => openExternalUrl(text)}
              />
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={type === 'Personal' ? 'blue' : 'green'}>{type}</Tag>
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
          <Tooltip title="Copy username">
            <Button
              type="text"
              size="small"
              icon={<Copy size={14} />}
              onClick={() => copyToClipboard(text, 'Username')}
            />
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {showPasswords[record.id] ? text : '••••••••'}
          </span>
          <Tooltip title={showPasswords[record.id] ? 'Hide password' : 'Show password'}>
            <Button
              type="text"
              size="small"
              icon={showPasswords[record.id] ? <EyeOff size={14} /> : <Eye size={14} />}
              onClick={() => togglePasswordVisibility(record.id)}
            />
          </Tooltip>
          <Tooltip title="Copy password">
            <Button
              type="text"
              size="small"
              icon={<Copy size={14} />}
              onClick={() => copyToClipboard(text, 'Password')}
            />
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleDateString()
    }
  ]

  return (
    <>
      <EntityTable
        rowKey="id"
        data={passwordEntries}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No password entries found. Click 'Add New' to get started."
      />

      {open && (
        <PasswordManagerModal
          editing={editing}
          handleCancel={handleCancel}
          onFinish={onFinish}
          form={form}
        />
      )}
    </>
  )
}

const PasswordManagerPage = withNotification(PasswordManagerPageWOC)

export default PasswordManagerPage
