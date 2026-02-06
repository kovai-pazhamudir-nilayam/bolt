import { Button, Card, Col, Form, Input, Row, Select, Space, Table, Tabs, Typography } from 'antd'
import { Database, Play, RefreshCcw, Table as TableIcon, Terminal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import SelectFormItem from '../../components/SelectFormItem'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { shellFactory } from '../../repos/shell.repo'
import { dbSecretsFactory } from '../../repos/DBSecretsPage.repo'

const { Text } = Typography
const { TextArea } = Input

// Initialize repositories
const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()
const { shellRepo } = shellFactory()
const { dbSecretsRepo } = dbSecretsFactory()

const ConnectPostgresPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeConnection, setActiveConnection] = useState(null)
  const [queryResult, setQueryResult] = useState(null)
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: [],
    allDbSecrets: []
  })

  const [form] = Form.useForm()
  const logRef = useRef(null)

  const validateGCPConfig = (config) => {
    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = config
    if (!cluster || !region || !project) {
      renderErrorNotification({
        message: 'Missing required GCP configuration (cluster, region, or project)'
      })
      return false
    }
    return true
  }

  const buildGcloudCommand = (config) => {
    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = config
    return `gcloud container clusters get-credentials ${cluster} --region ${region} --project ${project}`
  }

  const getJumpboxPod = async () => {
    const kubectlCommand = 'kubectl get pods -o=name --field-selector=status.phase=Running'
    let output = ''
    
    const logUnsub = shellRepo.onLog((data) => {
      if (data.type === 'stdout') output += data.output
    })

    try {
      const result = await shellRepo.run(kubectlCommand)
      if (result.code === 0) {
        const jumpboxPod = output
          .split('\n')
          .find((line) => line.includes('jumpbox') || line.includes('pod'))
          ?.split('/')[1]
          ?.trim()

        if (jumpboxPod) return jumpboxPod
        throw new Error('No running jumpbox pod found')
      } else {
        throw new Error(`Failed to get jumpbox pods (code ${result.code})`)
      }
    } finally {
      logUnsub()
    }
  }

  const parsePsqlCsv = (output) => {
    try {
      const allLines = output
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

      const lines = allLines.filter((line) => {
        if (line.match(/^\(\d+ row/)) return false
        if (line.startsWith('--')) return false
        return true
      })

      if (lines.length < 1) return null

      const headers = lines[0].split(',')
      if (headers.length < 1) return null

      const columns = headers.map((h) => ({
        title: h,
        dataIndex: h,
        key: h,
        ellipsis: true,
        render: (text) => <Text copyable={{ text: String(text) }}>{String(text)}</Text>
      }))

      const dataSource = lines.slice(1).map((line, idx) => {
        const values = line.split(',')
        const row = { key: idx }
        headers.forEach((h, i) => {
          row[h] = values[i] || ''
        })
        return row
      })

      return { columns, dataSource }
    } catch (error) {
      console.error('Failed to parse CSV:', error)
      return null
    }
  }

  const runPostgresQuery = async (query, jumpboxPod, dbSecret) => {
    const { db_host: host, db_user: user, db_password: password, db_name: dbName } = dbSecret

    if (!jumpboxPod) {
      renderErrorNotification({ message: 'No jumpbox pod selected. Please connect first.' })
      setLoading(false)
      return
    }

    // Robust escaping for nested shell layers
    const escapedPassword = password.replace(/'/g, "'\\''")
    const escapedQuery = query.replace(/'/g, "'\\''")
    
    // Construct the command using a simpler env PGPASSWORD wrapper
    const psqlCmd = `PGPASSWORD='${escapedPassword}' psql -h ${host} -U ${dbName} ${user} -A -F , -q -c '${escapedQuery}'`
    const command = `kubectl exec ${jumpboxPod} -- sh -c "${psqlCmd.replace(/"/g, '\\"')}"`

    // Log the command for debugging (sensitive info should be handled carefully in production)
    console.log('Final Executed Command:', command.replace(password, '****'))

    let output = ''
    let procId = null

    const logUnsub = shellRepo.onLog((data) => {
      if (!procId && data.type === 'info' && data.output.includes(command)) {
        procId = data.processId
      }
      if (procId && data.processId !== procId) return
      
      if (data.type === 'stdout') output += data.output + '\n'
      setLogs((prev) => [...prev, data.output])
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    })

    try {
      setLoading(true)
      setQueryResult(null)
      setLogs((prev) => [
        ...prev,
        `# EXECUTING: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`
      ])

      const result = await shellRepo.run(command)
      if (result.code === 0) {
        const parsed = parsePsqlCsv(output)
        if (parsed) {
          setQueryResult(parsed)
          renderSuccessNotification({ message: 'Query executed successfully' })
        } else {
          setLogs((prev) => [...prev, '# Query finished. No tabular results found (check logs for output).'])
        }
      } else {
        renderErrorNotification({ message: `Query failed (Exit Code: ${result.code})` })
      }
    } catch (err) {
      renderErrorNotification({ message: err.message })
      setLogs((prev) => [...prev, `Error: ${err.message}`])
    } finally {
      logUnsub()
      setLoading(false)
    }
  }

  const establishConnection = async (values) => {
    try {
      setQueryResult(null)
      setLogs(['# Initializing connection...'])

      const gcpConfig = await gcpProjectConfigRepo.getOne({
        company_code: values.company_code,
        env_code: values.env_code
      })

      if (!validateGCPConfig(gcpConfig)) return null

      setLogs((prev) => [...prev, '# Authenticating with GCP Cluster...'])
      const gcloudCommand = buildGcloudCommand(gcpConfig)

      const gcloudResult = await shellRepo.run(gcloudCommand)
      if (gcloudResult.code !== 0) throw new Error('Failed to get GCP credentials.')

      setLogs((prev) => [...prev, '# Discovering Jumpbox Pod...'])
      const jumpboxPod = await getJumpboxPod()

      const secret = datasource.allDbSecrets.find((db) => String(db.id) === String(values.db_id))
      if (!secret) throw new Error('Selected database configuration not found.')

      const connection = { pod: jumpboxPod, secret, gcpConfig, values }
      setActiveConnection(connection)
      setLogs((prev) => [
        ...prev,
        `# CONNECTED: ${secret.db_name} (${secret.db_host}) via ${jumpboxPod}`
      ])
      renderSuccessNotification({ message: `Connected to ${secret.db_name}` })
      return connection
    } catch (error) {
      renderErrorNotification({ message: error.message })
      setLogs((prev) => [...prev, `CONNECTION FAILED: ${error.message}`])
      return null
    }
  }

  const onFinish = async (values) => {
    const isSameConnection =
      activeConnection &&
      activeConnection.values.company_code === values.company_code &&
      activeConnection.values.env_code === values.env_code &&
      activeConnection.values.db_id === values.db_id

    if (isSameConnection) {
      await runPostgresQuery(values.query, activeConnection.pod, activeConnection.secret)
    } else {
      const conn = await establishConnection(values)
      if (conn && values.query) {
        await runPostgresQuery(values.query, conn.pod, conn.secret)
      }
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [allCompanies, allEnvironments, allDbSecrets] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll(),
        dbSecretsRepo.getAll()
      ])
      setDatasource({
        companies: allCompanies,
        environments: allEnvironments,
        allDbSecrets: allDbSecrets
      })
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }, [renderErrorNotification])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const companyCode = Form.useWatch('company_code', form)
  const envCode = Form.useWatch('env_code', form)

  const filteredDbSecrets = useMemo(() => {
    if (!companyCode || !envCode) return []
    return datasource.allDbSecrets.filter((db) => {
      const dbCompany = String(db.company_code || '').toLowerCase()
      const dbEnv = String(db.environment || '').toLowerCase()
      const selCompany = String(companyCode || '').toLowerCase()
      const selEnv = String(envCode || '').toLowerCase()
      return dbCompany === selCompany && dbEnv === selEnv
    })
  }, [companyCode, envCode, datasource.allDbSecrets])

  const dbOptions = useMemo(() => {
    return filteredDbSecrets.map((db) => ({
      label: `${db.db_name} (${db.db_host})`,
      value: db.id,
      key: db.id
    }))
  }, [filteredDbSecrets])

  const handleValuesChange = (changedValues) => {
    if (changedValues.company_code || changedValues.env_code) {
      form.setFieldsValue({ db_id: undefined })
    }
  }

  return (
    <div>
      <PageHeader
        title="Connect to GCP Postgres"
        description="Run SQL queries on GCP Postgres through a jumpbox pod. Select company, environment, and database to start."
      />
      <Form
        form={form}
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        layout="vertical"
        requiredMark={false}
        initialValues={{ query: 'SELECT 1;' }}
      >
        <Row gutter={[16, 16]}>
          <Col lg={8} xs={24}>
            <Card
              title={<Space><Database size={16} /> Connection</Space>}
              size="small"
              extra={activeConnection && <Text type="success" size="small">Connected</Text>}
            >
              <SelectFormItem
                options={datasource.companies}
                name="company_code"
                label="Company"
                transform="COMPANIES"
                placeholder="Select Company"
                loading={loading}
                allowClear
              />
              <SelectFormItem
                options={datasource.environments}
                name="env_code"
                label="Environment"
                transform="ENVIRONMENTS"
                placeholder="Select Environment"
                loading={loading}
                allowClear
              />
              <Form.Item
                name="db_id"
                label="Database"
                rules={[{ required: true, message: 'Please select a database' }]}
              >
                <Select
                  placeholder="Select a database"
                  disabled={dbOptions.length === 0}
                  options={dbOptions}
                  showSearch
                  allowClear
                  loading={loading}
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? '').toLowerCase()
                    const search = input.toLowerCase()
                    return label.includes(search)
                  }}
                />
              </Form.Item>
              <Space>
                <Button
                  type="primary"
                  ghost
                  icon={<RefreshCcw size={14} />}
                  onClick={() => form.validateFields(['company_code', 'env_code', 'db_id']).then(establishConnection)}
                  loading={loading}
                >
                  Connect
                </Button>
              </Space>
            </Card>
          </Col>

          <Col lg={16} xs={24}>
            <Card
              size="small"
              title={<Space><Play size={16} /> SQL Editor</Space>}
              extra={
                <Button
                  type="primary"
                  icon={<Play size={14} />}
                  onClick={() => form.submit()}
                  loading={loading}
                >
                  Run Query
                </Button>
              }
            >
              <Form.Item name="query" noStyle rules={[{ required: true, message: 'Please enter a query' }]}>
                <TextArea
                  rows={8}
                  placeholder="SELECT * FROM table LIMIT 10;"
                  style={{ fontFamily: 'monospace', fontSize: '14px' }}
                />
              </Form.Item>

              <Tabs
                defaultActiveKey="results"
                style={{ marginTop: 16 }}
                items={[
                  {
                    key: 'results',
                    label: <Space><TableIcon size={14} /> Results</Space>,
                    children: (
                      <Table
                        dataSource={queryResult?.dataSource || []}
                        columns={queryResult?.columns || []}
                        size="small"
                        scroll={{ x: 'max-content', y: 400 }}
                        pagination={{ size: 'small', pageSize: 10 }}
                        locale={{ emptyText: queryResult ? 'No data found' : 'Run a query to see results' }}
                      />
                    )
                  },
                  {
                    key: 'logs',
                    label: <Space><Terminal size={14} /> Logs</Space>,
                    children: <LogsViewer logRef={logRef} logs={logs} height={400} />
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

const ConnectPostgresPage = withNotification(ConnectPostgresPageWoc)

export default ConnectPostgresPage
