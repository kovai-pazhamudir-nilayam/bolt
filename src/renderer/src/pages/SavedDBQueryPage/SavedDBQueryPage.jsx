import { Button, Col, Form, Popconfirm, Row, Space, Table, Tooltip, Typography } from 'antd'
import { Edit2, PlayCircle, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import { dbSecretsFactory } from '../../repos/DBSecretsPage.repo'
import { savedDbQueryFactory } from '../../repos/SavedDBQueryPage.repo'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { shellFactory } from '../../repos/shell.repo'
import SavedDBQueryModal from './_blocks/SavedDBQueryModal'
import SavedDBQueryResultModal from './_blocks/SavedDBQueryResultModal'

const { Text } = Typography

// Initialize repositories
const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()
const { shellRepo } = shellFactory()
const { dbSecretsRepo } = dbSecretsFactory()
const { savedDbQueryRepo } = savedDbQueryFactory()

const SavedDBQueryPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [queryResult, setQueryResult] = useState(null)
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: [],
    allDbSecrets: [],
    savedQueries: []
  })

  // State for the saved query modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // State for running a query parameter prompt
  const [isRunModalOpen, setIsRunModalOpen] = useState(false)
  const [queryToRun, setQueryToRun] = useState(null)

  const [modalForm] = Form.useForm()
  const [runForm] = Form.useForm()
  const logRef = useRef(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [allCompanies, allEnvironments, allDbSecrets, savedQueries] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll(),
        dbSecretsRepo.getAll(),
        savedDbQueryRepo.getAll()
      ])
      setDatasource({
        companies: allCompanies,
        environments: allEnvironments,
        allDbSecrets: allDbSecrets,
        savedQueries: savedQueries
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

      return { columns, dataSource, rawOutput: output }
    } catch (error) {
      console.error('Failed to parse CSV:', error)
      return null
    }
  }

  const downloadCSV = (result) => {
    if (!result || !result.rawOutput) return
    const blob = new Blob([result.rawOutput], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `query_result_${new Date().toISOString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const runPostgresQuery = async (query, jumpboxPod, dbSecret) => {
    const { db_host: host, db_user: user, db_password: password, db_name: dbName } = dbSecret

    if (!jumpboxPod) {
      renderErrorNotification({ message: 'No jumpbox pod selected. Please connect first.' })
      setLoading(false)
      return
    }

    const escapedPassword = password.replace(/'/g, "'\\''")
    const escapedQuery = query.replace(/'/g, "'\\''")
    const psqlCmd = `PGPASSWORD='${escapedPassword}' psql -h ${host} -U ${user} ${dbName} -A -F , -q -c '${escapedQuery}'`
    const command = `kubectl exec ${jumpboxPod} -- sh -c "${psqlCmd.replace(/"/g, '\\"')}"`

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
          setLogs((prev) => [
            ...prev,
            '# Query finished. No tabular results found (check logs for output).'
          ])
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

  const establishConnection = async (values, dbSecret) => {
    try {
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

      return { pod: jumpboxPod, secret: dbSecret, gcpConfig, values }
    } catch (error) {
      renderErrorNotification({ message: error.message })
      setLogs((prev) => [...prev, `CONNECTION FAILED: ${error.message}`])
      return null
    }
  }

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      modalForm.setFieldsValue({
        title: record.title,
        description: record.description,
        query: record.query,
        db_id: record.db_id
      })
    } else {
      setEditingId(null)
      modalForm.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleSaveQuery = async (values) => {
    try {
      setLoading(true)
      await savedDbQueryRepo.upsert({ ...values, id: editingId })
      renderSuccessNotification({ message: 'Saved query successfully.' })
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      await savedDbQueryRepo.delete(id)
      renderSuccessNotification({ message: 'Deleted successfully.' })
      fetchData()
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRunModalOpen = (record) => {
    setQueryToRun(record)
    runForm.resetFields()
    setQueryResult(null)
    setLogs([])
    setIsRunModalOpen(true)
  }

  const onRunSubmit = async (values) => {
    const dbSecret = datasource.allDbSecrets.find((db) => db.id === queryToRun.db_id)
    if (!dbSecret) {
      renderErrorNotification({ message: 'Database configuration not found for this saved query.' })
      return
    }

    const conn = await establishConnection(values, dbSecret)
    if (conn) {
      await runPostgresQuery(queryToRun.query, conn.pod, dbSecret)
    }
  }

  const allDbOptions = useMemo(() => {
    return datasource.allDbSecrets.map((db) => ({
      label: `${db.db_name} (${db.environment} - ${db.company_code})`,
      value: db.id,
      key: db.id
    }))
  }, [datasource.allDbSecrets])

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Database',
      key: 'db_id',
      render: (_, record) => {
        const db = datasource.allDbSecrets.find((db) => db.id === record.db_id)
        if (!db) return <Text type="danger">Not Found</Text>
        return `${db.db_name} (${db.company_code} - ${db.environment})`
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Run Query">
            <Button
              type="text"
              icon={<PlayCircle size={16} />}
              onClick={() => handleRunModalOpen(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Query">
            <Button
              type="text"
              icon={<Edit2 size={16} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Saved Queries" description="Manage and run your saved database queries." />
      <Row justify={'end'} style={{ marginBottom: '16px' }}>
        <Col>
          <Button type="primary" icon={<Plus />} onClick={() => handleOpenModal()}>
            Add Query
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={datasource.savedQueries}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15 }}
      />

      {isModalOpen && (
        <SavedDBQueryModal
          editingId={editingId}
          modalForm={modalForm}
          handleSaveQuery={handleSaveQuery}
          allDbOptions={allDbOptions}
          loading={loading}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {isRunModalOpen && (
        <SavedDBQueryResultModal
          queryToRun={queryToRun}
          runForm={runForm}
          onRunSubmit={onRunSubmit}
          datasource={datasource}
          loading={loading}
          queryResult={queryResult}
          logs={logs}
          logRef={logRef}
          downloadCSV={downloadCSV}
          setIsRunModalOpen={setIsRunModalOpen}
        />
      )}
    </div>
  )
}

const SavedDBQueryPage = withNotification(SavedDBQueryPageWOC)

export default SavedDBQueryPage
