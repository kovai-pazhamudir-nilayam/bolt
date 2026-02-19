import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  Tabs,
  Typography,
  Tooltip,
  Alert,
  Modal,
  Descriptions,
  Tag
} from 'antd'
import {
  BookOpen,
  Terminal as TerminalIcon,
  Table as TableIcon,
  Trash2,
  RefreshCw,
  Info,
  Search,
  ExternalLink
} from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import SelectFormItem from '../../components/SelectFormItem'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { shellFactory } from '../../repos/shell.repo'
import TerminalViewer from '../../components/TerminalViewer/TerminalViewer'

const { Title, Text } = Typography

// Initialize repositories
const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()
const { shellRepo } = shellFactory()

const REDIS_DOCS = [
  {
    category: 'Basic Commands',
    commands: [
      { key: 'PING', desc: 'Test connection' },
      { key: 'SET key value', desc: 'Set key to hold string value' },
      { key: 'GET key', desc: 'Get value of key' },
      { key: 'DEL key', desc: 'Delete a key' },
      { key: 'EXISTS key', desc: 'Check if key exists' }
    ]
  },
  {
    category: 'Querying Keys',
    commands: [
      { key: "KEYS '*'", desc: 'List all keys (use with caution)' },
      { key: 'SCAN 0', desc: 'Incrementally iterate over keys' },
      { key: 'TYPE key', desc: 'Determine type of data at key' },
      { key: 'TTL key', desc: 'Get time to live for a key' }
    ]
  },
  {
    category: 'Data Structures',
    commands: [
      { key: 'HGETALL key', desc: 'Get all fields/values in a hash' },
      { key: 'LRANGE key 0 -1', desc: 'Get all elements from a list' },
      { key: 'SMEMBERS key', desc: 'Get all members of a set' },
      { key: 'ZRANGE key 0 -1', desc: 'Get range of members in sorted set' }
    ]
  }
]

const ConnectRedisPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [form] = Form.useForm()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: []
  })

  // Redis Keys Table State
  const [keysData, setKeysData] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [query, setQuery] = useState('')
  const [keyFilter, setKeyFilter] = useState('')
  const [activeTab, setActiveTab] = useState('terminal')

  // Details Modal State
  const [detailModal, setDetailModal] = useState({
    visible: false,
    key: null,
    loading: false,
    info: {},
    showDecoded: false
  })

  // Connection context
  const [context, setContext] = useState({
    pod: null,
    config: null
  })

  const validateRedisConfig = (config) => {
    if (!config?.redis_host || !config?.redis_password) {
      renderErrorNotification({ message: 'Redis config does not exist' })
      return false
    }
    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = config
    if (!cluster || !region || !project) {
      renderErrorNotification({
        message: 'Missing required GCP/Redis configuration (cluster, region, or project)'
      })
      return false
    }
    return true
  }

  const getJumpboxPod = async () => {
    const kubectlCommand = 'kubectl get pods -o=name --field-selector=status.phase=Running'
    return new Promise((resolve, reject) => {
      let output = ''
      const handleLog = (data) => (output += data.output)
      const handleEnd = (data) => {
        if (data.code === 0) {
          const jumpboxPod = output
            .split('\n')
            .find((line) => line.includes('jumpbox') || line.includes('pod'))
            ?.split('/')[1]
            ?.trim()
          jumpboxPod ? resolve(jumpboxPod) : reject(new Error('No running jumpbox pod found'))
        } else {
          reject(new Error(`Failed to get jumpbox pod with code ${data.code}`))
        }
      }
      shellRepo.onLog(handleLog)
      shellRepo.onEnd(handleEnd)
      shellRepo.run(kubectlCommand).catch(reject)
    })
  }

  const runShellCommand = async (command, description) => {
    return new Promise((resolve, reject) => {
      let output = ''
      const lUnsub = shellRepo.onLog((data) => {
        // Only include actual process output (stdout/stderr) in the returned string
        // Exclude meta-logs like 'Starting command' which are sent as type 'info'
        if (data.type === 'stdout' || data.type === 'stderr') {
          output += data.output
        }
        setLogs((prev) => [...prev, data.output])
      })
      const eUnsub = shellRepo.onEnd((data) => {
        lUnsub()
        eUnsub()
        if (data.code === 0) resolve(output)
        else reject(new Error(`${description} failed with code ${data.code}`))
      })
      shellRepo.run(command).catch((err) => {
        lUnsub()
        eUnsub()
        reject(err)
      })
    })
  }

  const runRedisCommand = async (redisCommand) => {
    if (!context.pod || !context.config) {
      renderErrorNotification({ message: 'Please connect to Redis first' })
      return null
    }
    const { redis_host: host, redis_password: password } = context.config
    const command = `kubectl exec ${context.pod} -- sh -c "export REDISCLI_AUTH='${password}' && redis-cli -h ${host} --no-auth-warning --raw ${redisCommand}"`
    return await runShellCommand(command, `Redis: ${redisCommand}`)
  }

  const onConnect = async (values) => {
    setLoading(true)
    setLogs([])
    try {
      const config = await gcpProjectConfigRepo.getOne({
        company_code: values.company_code,
        env_code: values.env_code
      })

      if (!validateRedisConfig(config)) return

      const gcloudCmd = `gcloud container clusters get-credentials ${config.gcp_cluster} --region ${config.gcp_region} --project ${config.gcp_project}`
      await runShellCommand(gcloudCmd, 'GCP Auth')

      const pod = await getJumpboxPod()
      setContext({ pod, config })
      setConnected(true)
      renderSuccessNotification({ message: `Connected to jumpbox: ${pod}` })

      // Initial ping check
      const ping = await runRedisCommand('ping')
      if (ping.includes('PONG')) {
        renderSuccessNotification({ message: 'Redis connection successful' })
        fetchKeys()
      }
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const output = await runRedisCommand("keys '*'")
      const keys = output
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k && !k.startsWith('Starting command'))
        .map((k, index) => ({ key: k, id: index }))
      setKeysData(keys)
    } catch {
      renderErrorNotification({ message: 'Failed to fetch keys' })
    } finally {
      setLoading(false)
    }
  }

  const handleManualQuery = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      await runRedisCommand(query)
      setQuery('')
      // If user ran a command that might change keys, refresh table
      if (query.toUpperCase().includes('SET') || query.toUpperCase().includes('DEL')) {
        fetchKeys()
      }
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKeys = async (keysToDelete) => {
    setLoading(true)
    try {
      for (const k of keysToDelete) {
        await runRedisCommand(`DEL "${k}"`)
      }
      renderSuccessNotification({ message: `Deleted ${keysToDelete.length} key(s)` })
      setSelectedRowKeys([])
      fetchKeys()
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const fetchKeyDetails = async (key) => {
    setDetailModal({ visible: true, key, loading: true, info: {} })
    try {
      const getCleanOutput = (raw, firstLineOnly = false) => {
        const lines = raw
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('Starting command'))
        return firstLineOnly ? lines[0] || '' : lines.join('\n')
      }

      const typeOutputRaw = await runRedisCommand(`TYPE "${key}"`)
      const type = getCleanOutput(typeOutputRaw, true).toLowerCase() || 'unknown'

      const ttlOutputRaw = await runRedisCommand(`TTL "${key}"`)
      const ttl = getCleanOutput(ttlOutputRaw, true) || '-1'

      let value = ''
      if (type === 'string') {
        const valOutputRaw = await runRedisCommand(`GET "${key}"`)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'hash') {
        const valOutputRaw = await runRedisCommand(`HGETALL "${key}"`)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'list') {
        const valOutputRaw = await runRedisCommand(`LRANGE "${key}" 0 -1`)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'set') {
        const valOutputRaw = await runRedisCommand(`SMEMBERS "${key}"`)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'zset') {
        const valOutputRaw = await runRedisCommand(`ZRANGE "${key}" 0 -1`)
        value = getCleanOutput(valOutputRaw)
      }

      setDetailModal((prev) => ({
        ...prev,
        loading: false,
        info: { type, ttl, value },
        showDecoded: false
      }))
    } catch {
      renderErrorNotification({ message: 'Failed to fetch key details' })
      setDetailModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const decodeJWT = (token) => {
    if (!token) return null
    try {
      const parts = token.replace(/^"(.*)"$/, '$1').split('.')
      if (parts.length !== 3) return null

      const decodePart = (part) => {
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(decodeURIComponent(escape(atob(base64))))
      }

      return {
        header: decodePart(parts[0]),
        payload: decodePart(parts[1])
      }
    } catch {
      return null
    }
  }

  useEffect(() => {
    const loadSelectionData = async () => {
      const [allCompanies, allEnvironments] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])
      setDatasource({ companies: allCompanies, environments: allEnvironments })
    }
    loadSelectionData()
  }, [])

  const columns = [
    { title: 'Key Name', dataIndex: 'key', key: 'key', render: (text) => <Text code>{text}</Text> },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Delete Key">
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => handleDeleteKeys([record.key])}
          />
        </Tooltip>
      )
    }
  ]

  const formatTTL = (seconds) => {
    const s = parseInt(seconds)
    if (isNaN(s) || s < 0) {
      if (s === -1) return 'No Expiry'
      if (s === -2) return 'Expired'
      return '...'
    }

    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const rs = s % 60

    const parts = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (rs > 0 || parts.length === 0) parts.push(`${rs}s`)

    return `${s}s (${parts.join(' ')})`
  }

  return (
    <div className="ConnectRedisPage">
      <PageHeader
        title="Redis Management"
        description="Securely connect and manage Redis instances via GCP Jumpbox."
      />

      <Row gutter={[24, 24]}>
        {/* Main Section */}
        <Col span={18}>
          <Card bordered={false} className="main-card">
            <Form form={form} onFinish={onConnect} layout="inline" style={{ marginBottom: 24 }}>
              <Space>
                <SelectFormItem
                  options={datasource.companies}
                  name="company_code"
                  label="Company"
                  transform="COMPANIES"
                  style={{ width: 200 }}
                />
                <SelectFormItem
                  options={datasource.environments}
                  name="env_code"
                  label="Environment"
                  transform="ENVIRONMENTS"
                  style={{ width: 150 }}
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<RefreshCw size={16} />}
                >
                  {connected ? 'Reconnect' : 'Connect'}
                </Button>
              </Space>
            </Form>

            {connected && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <Input.Search
                    placeholder="Enter Redis command (e.g., SET user:1 'John')"
                    enterButton="Execute"
                    size="large"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onSearch={handleManualQuery}
                    loading={loading}
                    prefix={<TerminalIcon size={16} style={{ marginRight: 8 }} />}
                  />
                </div>

                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: 'terminal',
                      label: (
                        <span>
                          <TerminalIcon size={16} style={{ marginRight: 8 }} />
                          Terminal
                        </span>
                      ),
                      children: <TerminalViewer logs={logs} height={500} />
                    },
                    {
                      key: 'table',
                      label: (
                        <span>
                          <TableIcon size={16} style={{ marginRight: 8 }} />
                          Explore Keys
                        </span>
                      ),
                      children: (
                        <div style={{ background: '#fff', padding: 16 }}>
                          <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col flex="auto">
                              <Space>
                                <Button
                                  icon={<RefreshCw size={16} />}
                                  onClick={fetchKeys}
                                  loading={loading}
                                >
                                  Refresh
                                </Button>
                                <Button
                                  danger
                                  icon={<Trash2 size={16} />}
                                  disabled={selectedRowKeys.length === 0}
                                  onClick={() => {
                                    const keys = keysData
                                      .filter((item) => selectedRowKeys.includes(item.id))
                                      .map((item) => item.key)
                                    handleDeleteKeys(keys)
                                  }}
                                >
                                  Delete ({selectedRowKeys.length})
                                </Button>
                              </Space>
                            </Col>
                            <Col span={8}>
                              <Input
                                placeholder="Filter keys..."
                                prefix={<Search size={14} />}
                                value={keyFilter}
                                onChange={(e) => setKeyFilter(e.target.value)}
                                allowClear
                              />
                            </Col>
                          </Row>
                          <Table
                            size="small"
                            rowSelection={{
                              selectedRowKeys,
                              onChange: setSelectedRowKeys
                            }}
                            columns={columns}
                            dataSource={keysData.filter((item) =>
                              item.key.toLowerCase().includes(keyFilter.toLowerCase())
                            )}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 15 }}
                            onRow={(record) => ({
                              onClick: () => fetchKeyDetails(record.key),
                              style: { cursor: 'pointer' }
                            })}
                          />
                        </div>
                      )
                    }
                  ]}
                />

                <Modal
                  title={
                    <Space>
                      <Info size={18} />
                      <Text strong>{detailModal.key}</Text>
                    </Space>
                  }
                  open={detailModal.visible}
                  onCancel={() => setDetailModal({ ...detailModal, visible: false })}
                  footer={null}
                  width={700}
                >
                  <Descriptions bordered column={1} size="small" loading={detailModal.loading}>
                    <Descriptions.Item label="Type">
                      <Tag color="blue">{detailModal.info.type || '...'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="TTL">
                      <Tag color={detailModal.info.ttl < 0 ? 'default' : 'orange'}>
                        {formatTTL(detailModal.info.ttl)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Value">
                      <div
                        style={{
                          background: '#f5f5f5',
                          padding: 12,
                          borderRadius: 4,
                          maxHeight: 400,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          position: 'relative'
                        }}
                      >
                        {detailModal.showDecoded ? (
                          <div>
                            <div style={{ marginBottom: 8, color: '#1890ff', fontWeight: 'bold' }}>
                              Decoded JWT:
                            </div>
                            <pre style={{ margin: 0 }}>
                              {JSON.stringify(decodeJWT(detailModal.info.value), null, 2)}
                            </pre>
                            <Button
                              size="small"
                              style={{ marginTop: 8 }}
                              onClick={() => setDetailModal({ ...detailModal, showDecoded: false })}
                            >
                              Show Raw
                            </Button>
                          </div>
                        ) : (
                          <>
                            {detailModal.info.value ||
                              (detailModal.loading ? 'Fetching...' : 'Empty')}
                            {decodeJWT(detailModal.info.value) && (
                              <Button
                                size="small"
                                type="primary"
                                icon={<ExternalLink size={12} />}
                                style={{ marginTop: 8, display: 'block' }}
                                onClick={() =>
                                  setDetailModal({ ...detailModal, showDecoded: true })
                                }
                              >
                                Decode JWT
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Modal>
              </>
            )}

            {!connected && (
              <Alert
                message="Not Connected"
                description="Please select a company and environment to establish a connection to Redis."
                type="info"
                showIcon
                icon={<Info />}
              />
            )}
          </Card>
        </Col>

        {/* Info Sidebar */}
        <Col span={6}>
          <Card
            title={
              <span>
                <BookOpen size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                Help Docs
              </span>
            }
            bordered={false}
          >
            <Typography>
              {REDIS_DOCS.map((section) => (
                <div key={section.category} style={{ marginBottom: 24 }}>
                  <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                    {section.category}
                  </Title>
                  {section.commands.map((cmd) => (
                    <div
                      key={cmd.key}
                      style={{ marginBottom: 16, cursor: 'pointer' }}
                      onClick={() => setQuery(cmd.key.split(' ')[0])}
                    >
                      <Text strong code style={{ color: '#1890ff', display: 'block' }}>
                        {cmd.key}
                      </Text>
                      <Text type="secondary" size="small">
                        {cmd.desc}
                      </Text>
                    </div>
                  ))}
                </div>
              ))}
            </Typography>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const ConnectRedisPage = withNotification(ConnectRedisPageWoc)

export default ConnectRedisPage
