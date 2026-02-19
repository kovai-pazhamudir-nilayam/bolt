import { Button, Form, Input, Modal, Select, Space, Typography, Tooltip, Tag } from 'antd'
import { Copy, Eye, EyeOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import SubmitBtnForm from '../../../components/SubmitBtnForm'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import { dbSecretsFactory } from '../../../repos/DBSecretsPage.repo'

const { dbSecretsRepo } = dbSecretsFactory()
const { companyRepo, environmentRepo } = settingsFactory()
const { Text } = Typography

const DBSecretsTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [entries, setEntries] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: []
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [data, companies, environments] = await Promise.all([
        dbSecretsRepo.getAll(),
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])
      setEntries(data || [])
      setDatasource({
        companies: companies || [],
        environments: environments || []
      })
    } catch (error) {
      renderErrorNotification(error)
    } finally {
      setLoading(false)
    }
  }, [renderErrorNotification])

  useEffect(() => {
    loadData()
  }, [loadData])

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      renderSuccessNotification({ message: `${label} copied!` })
    } catch {
      renderErrorNotification({ message: 'Failed to copy' })
    }
  }

  const columns = [
    {
      title: 'Company',
      dataIndex: 'company_code',
      key: 'company_code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Environment',
      dataIndex: 'environment',
      key: 'environment',
      render: (env) => {
        const colors = { production: 'red', staging: 'orange', development: 'green' }
        return <Tag color={colors[env.toLowerCase()] || 'default'}>{env.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Host',
      dataIndex: 'db_host',
      key: 'db_host',
      render: (text) => (
        <Space>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {text}
          </Text>
          <Tooltip title="Copy Host">
            <Button
              type="text"
              size="small"
              icon={<Copy size={12} />}
              onClick={() => copyToClipboard(text, 'Host')}
            />
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'DB Name',
      dataIndex: 'db_name',
      key: 'db_name'
    },
    {
      title: 'User',
      dataIndex: 'db_user',
      key: 'db_user',
      render: (text) => (
        <Space>
          <Text>{text}</Text>
          <Tooltip title="Copy User">
            <Button
              type="text"
              size="small"
              icon={<Copy size={12} />}
              onClick={() => copyToClipboard(text, 'Username')}
            />
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Password',
      dataIndex: 'db_password',
      key: 'db_password',
      render: (text, record) => (
        <Space>
          <Text>{showPasswords[record.id] ? text : '••••••••'}</Text>
          <Button
            type="text"
            size="small"
            icon={showPasswords[record.id] ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => setShowPasswords((prev) => ({ ...prev, [record.id]: !prev[record.id] }))}
          />
          <Tooltip title="Copy Password">
            <Button
              type="text"
              size="small"
              icon={<Copy size={12} />}
              onClick={() => copyToClipboard(text, 'Password')}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const onFinish = async (values) => {
    try {
      await dbSecretsRepo.upsert({ ...values, id: editing?.id })
      renderSuccessNotification({
        message: `Secret ${editing?.id ? 'updated' : 'added'} successfully`
      })
      setEditing(null)
      loadData()
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  return (
    <>
      <EntityTable
        rowKey="id"
        data={entries}
        columns={columns}
        loading={loading}
        onAdd={() => setEditing({})}
        onEdit={(record) => setEditing(record)}
        onDelete={async (record) => {
          try {
            await dbSecretsRepo.delete(record.id)
            renderSuccessNotification({ message: 'Secret deleted' })
            loadData()
          } catch (error) {
            renderErrorNotification(error)
          }
        }}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
      />

      {editing && (
        <Modal
          title={editing.id ? 'Edit DB Secret' : 'Add DB Secret'}
          open={true}
          onCancel={() => setEditing(null)}
          footer={null}
          width={600}
        >
          <Form layout="vertical" initialValues={editing} onFinish={onFinish}>
            <Form.Item name="company_code" label="Company Code" rules={[{ required: true }]}>
              <Select placeholder="Select company">
                {datasource.companies.map((co) => (
                  <Select.Option key={co.company_code} value={co.company_code}>
                    {co.company_code} - {co.company_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="environment" label="Environment" rules={[{ required: true }]}>
              <Select placeholder="Select environment">
                {datasource.environments.map((env) => (
                  <Select.Option key={env.env_code} value={env.env_code}>
                    {env.env_code} ({env.env_name})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="db_host" label="DB Host" rules={[{ required: true }]}>
              <Input placeholder="e.g. localhost or 1.2.3.4" />
            </Form.Item>

            <Form.Item name="db_name" label="DB Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. main_db" />
            </Form.Item>

            <Form.Item name="db_user" label="DB User" rules={[{ required: true }]}>
              <Input placeholder="Database username" />
            </Form.Item>

            <Form.Item name="db_password" label="DB Password" rules={[{ required: true }]}>
              <Input.Password placeholder="Database password" />
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea placeholder="Additional info (port, special instructions, etc.)" />
            </Form.Item>

            <SubmitBtnForm />
          </Form>
        </Modal>
      )}
    </>
  )
}

const DBSecretsTab = withNotification(DBSecretsTabWOC)
export default DBSecretsTab
