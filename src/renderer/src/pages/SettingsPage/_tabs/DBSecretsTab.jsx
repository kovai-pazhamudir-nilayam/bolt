import { Button, Form, Input, Modal, Select, Space, Tag, Card, Divider } from 'antd'
import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import SubmitBtnForm from '../../../components/SubmitBtnForm'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import { dbSecretsFactory } from '../../../repos/DBSecretsPage.repo'

const { dbSecretsRepo } = dbSecretsFactory()
const { companyRepo, environmentRepo } = settingsFactory()

const DBSecretsTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [entries, setEntries] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
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

      const groupedData = Object.values(
        (data || []).reduce((acc, curr) => {
          const key = `${curr.company_code}_${curr.db_name}`
          if (!acc[key]) {
            acc[key] = {
              id: key,
              company_code: curr.company_code,
              db_name: curr.db_name,
              secrets: [],
              originalIds: []
            }
          }
          acc[key].secrets.push({
            id: curr.id,
            environment: curr.environment,
            db_host: curr.db_host,
            db_user: curr.db_user,
            db_password: curr.db_password,
            notes: curr.notes
          })
          acc[key].originalIds.push(curr.id)
          return acc
        }, {})
      )

      setEntries(groupedData)
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

  const columns = [
    {
      title: 'Company',
      dataIndex: 'company_code',
      key: 'company_code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'DB Name',
      dataIndex: 'db_name',
      key: 'db_name'
    },
    {
      title: 'Environments',
      dataIndex: 'secrets',
      key: 'environments',
      render: (secrets) => {
        const colors = { production: 'red', staging: 'orange', development: 'green' }
        return (
          <Space size={[0, 8]} wrap>
            {secrets.map((s) => (
              <Tag key={s.id} color={colors[s.environment?.toLowerCase()] || 'default'}>
                {s.environment?.toUpperCase()}
              </Tag>
            ))}
          </Space>
        )
      }
    }
  ]

  const onFinish = async (values) => {
    try {
      const promises = []

      const oldIds = editing?.id ? editing.secrets.map((s) => s.id).filter(Boolean) : []
      const newIds = values.secrets.map((s) => s.id).filter(Boolean)
      const idsToDelete = oldIds.filter((id) => !newIds.includes(id))

      idsToDelete.forEach((id) => {
        promises.push(dbSecretsRepo.delete(id))
      })

      values.secrets.forEach((secret) => {
        promises.push(
          dbSecretsRepo.upsert({
            ...secret,
            company_code: values.company_code,
            db_name: values.db_name
          })
        )
      })

      await Promise.all(promises)
      renderSuccessNotification({
        message: `Secret(s) saved successfully`
      })
      setEditing(null)
      loadData()
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const formInitialValues = editing
    ? editing.id
      ? {
          company_code: editing.company_code,
          db_name: editing.db_name,
          secrets: editing.secrets.map((s) => ({
            id: s.id,
            environment: s.environment,
            db_host: s.db_host,
            db_user: s.db_user,
            db_password: s.db_password,
            notes: s.notes
          }))
        }
      : {
          company_code: undefined,
          db_name: undefined,
          secrets: [{}]
        }
    : null

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
            await Promise.all(record.originalIds.map((id) => dbSecretsRepo.delete(id)))
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
          width={800}
        >
          <Form layout="vertical" initialValues={formInitialValues} onFinish={onFinish}>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="company_code"
                label="Company Code"
                rules={[{ required: true }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select company">
                  {datasource.companies.map((co) => (
                    <Select.Option key={co.company_code} value={co.company_code}>
                      {co.company_code} - {co.company_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="db_name"
                label="DB Name"
                rules={[{ required: true }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. main_db" />
              </Form.Item>
            </div>

            <Divider orientation="left" orientationMargin="0">
              Environment Secrets
            </Divider>

            <Form.List name="secrets">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size="small"
                      title={<b>Secret {index + 1}</b>}
                      extra={
                        fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={() => remove(field.name)}
                          />
                        )
                      }
                    >
                      <Form.Item {...field} name={[field.name, 'id']} style={{ display: 'none' }}>
                        <Input />
                      </Form.Item>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) =>
                            prevValues.secrets !== currentValues.secrets
                          }
                        >
                          {({ getFieldValue }) => {
                            const secrets = getFieldValue('secrets') || []
                            const selectedEnvs = secrets.map((s) => s?.environment).filter(Boolean)
                            const currentEnv = getFieldValue(['secrets', field.name, 'environment'])

                            return (
                              <Form.Item
                                {...field}
                                name={[field.name, 'environment']}
                                label="Environment"
                                rules={[{ required: true }]}
                                style={{ flex: 1 }}
                              >
                                <Select placeholder="Select env">
                                  {datasource.environments.map((env) => (
                                    <Select.Option
                                      key={env.env_code}
                                      value={env.env_code}
                                      disabled={
                                        selectedEnvs.includes(env.env_code) &&
                                        currentEnv !== env.env_code
                                      }
                                    >
                                      {env.env_code} ({env.env_name})
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            )
                          }}
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'db_host']}
                          label="DB Host"
                          rules={[{ required: true }]}
                          style={{ flex: 1 }}
                        >
                          <Input placeholder="e.g. localhost or IP" />
                        </Form.Item>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'db_user']}
                          label="DB User"
                          rules={[{ required: true }]}
                          style={{ flex: 1 }}
                        >
                          <Input placeholder="Database username" />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'db_password']}
                          label="DB Password"
                          rules={[{ required: true }]}
                          style={{ flex: 1 }}
                        >
                          <Input.Password placeholder="Database password" />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}

                  <Button type="dashed" onClick={() => add()} icon={<Plus size={16} />} block>
                    Add Environment Secret
                  </Button>
                </div>
              )}
            </Form.List>

            <Divider style={{ margin: '24px 0 0 0' }} />
            <br />
            <SubmitBtnForm />
          </Form>
        </Modal>
      )}
    </>
  )
}

const DBSecretsTab = withNotification(DBSecretsTabWOC)
export default DBSecretsTab
