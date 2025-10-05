import { Button, Form, Input, Modal, Select, Tag, Tooltip } from 'antd'
import { Copy, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import EntityTable from '../../components/EntityTable'
import SubmitBtnForm from '../../components/SubmitBtnForm'
import withNotification from '../../hoc/withNotification'
import { passwordManagerFactory } from '../../repos/PasswordManagerPage.repo'
import InputFormItem from '../../components/InputFormItem'

const { passwordManagerRepo } = passwordManagerFactory()

const getPasswordManagerColumns = ({
  renderSuccessNotification,
  renderErrorNotification,
  togglePasswordVisibility,
  showPasswords
}) => {
  const openExternalUrl = (url) => {
    if (url) {
      window.shellAPI.openExternal(url)
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
        message: error.message || 'Failed to copy to clipboard'
      })
    }
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
      render: (text) => (
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
      render: (text) => (
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

  return columns
}

const PasswordManagerModal = ({ editing, handleCancel, onFinish }) => {
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
      <Form initialValues={editing} onFinish={onFinish} layout="vertical" requiredMark={false}>
        <InputFormItem
          name="title"
          label="Title"
          placeholder="e.g., Gmail, GitHub, Company Portal"
        />

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

        <InputFormItem name="username" label="Username" />

        <InputFormItem name="password" label="Password" />

        <InputFormItem
          name="notes"
          label="Notes"
          isTextArea={true}
          placeholder="Additional notes (optional)"
        />

        <SubmitBtnForm />
      </Form>
    </Modal>
  )
}

const PasswordManagerPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [passwordEntries, setPasswordEntries] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
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
    setEditing({})
  }

  const handleEdit = (item) => {
    setEditing(item)
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
    setEditing(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const onFinish = async (values) => {
    try {
      const dataToSave = editing ? { ...values, id: editing.id } : values
      await passwordManagerRepo.upsert(dataToSave)
      setEditing(null)
      loadData()
      renderSuccessNotification({
        message: `Password entry ${editing ? 'updated' : 'created'} successfully!`
      })
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <>
      <EntityTable
        rowKey="id"
        data={passwordEntries}
        columns={getPasswordManagerColumns({
          renderSuccessNotification,
          renderErrorNotification,
          togglePasswordVisibility,
          showPasswords
        })}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No password entries found. Click 'Add New' to get started."
      />

      {editing && (
        <PasswordManagerModal editing={editing} handleCancel={handleCancel} onFinish={onFinish} />
      )}
    </>
  )
}

const PasswordManagerPage = withNotification(PasswordManagerPageWOC)

export default PasswordManagerPage
