import { Button, Col, Form, Modal, Row, Space, Table, Tabs, Typography } from 'antd'
import SelectFormItem from '../../../components/SelectFormItem'
import { Download, Play, TableIcon, Terminal } from 'lucide-react'
import LogsViewer from '../../../components/LogsViewer/LogsViewer'
import withNotification from '../../../hoc/withNotification'
import { shellFactory } from '../../../repos/shell.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import { useRef, useState } from 'react'

const { Text } = Typography

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

const SavedDBQueryResultModalWOC = ({
  queryToRun,
  runForm,
  datasource,
  setIsRunModalOpen,
  renderErrorNotification,
  renderSuccessNotification
}) => {
  const logRef = useRef(null)
  const [queryResult, setQueryResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const { shellRepo } = shellFactory()
  const { gcpProjectConfigRepo } = settingsFactory()

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

  const onRunSubmit = async (values) => {
    setLoading(true)
    setQueryResult(null)
    setLogs([])
    const dbSecret = datasource.allDbSecrets.find(
      (db) =>
        db.company_code === queryToRun.company_code &&
        db.db_name === queryToRun.db_name &&
        db.environment === values.env_code
    )
    if (!dbSecret) {
      renderErrorNotification({
        message: `No DB secret found for ${queryToRun.db_name} in the selected environment.`
      })
      setLoading(false)
      return
    }

    const conn = await establishConnection(
      { ...values, company_code: queryToRun.company_code },
      dbSecret
    )
    if (conn) {
      await runPostgresQuery(queryToRun.query, conn.pod, dbSecret)
    }
  }
  return (
    <Modal
      title={`Run: ${queryToRun?.title}`}
      open
      onCancel={() => setIsRunModalOpen(false)}
      footer={null}
      width={900}
    >
      <Form form={runForm} onFinish={onRunSubmit} layout="vertical">
        <Row gutter={[16, 16]} align="bottom">
          <Col span={20}>
            <SelectFormItem
              options={datasource.environments}
              name="env_code"
              label="Environment"
              transform="ENVIRONMENTS"
              placeholder="Select Environment"
              loading={loading}
            />
          </Col>
          <Col span={4}>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit" loading={loading} block icon={<Play />}>
                Run
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Tabs
        defaultActiveKey="results"
        style={{ marginTop: 16 }}
        items={[
          {
            key: 'results',
            label: (
              <Space>
                <TableIcon size={14} /> Results
              </Space>
            ),
            children: (
              <div>
                {queryResult && (
                  <Row justify={'end'}>
                    <Col>
                      <Button
                        icon={<Download size={14} />}
                        onClick={() => downloadCSV(queryResult)}
                        style={{ marginBottom: 8 }}
                      >
                        Download CSV
                      </Button>
                    </Col>
                  </Row>
                )}
                <Table
                  dataSource={queryResult?.dataSource || []}
                  columns={queryResult?.columns || []}
                  size="small"
                  scroll={{ x: 'max-content', y: 400 }}
                  pagination={{ size: 'small', pageSize: 10 }}
                  locale={{
                    emptyText: queryResult ? 'No data found' : 'Run query to see results'
                  }}
                />
              </div>
            )
          },
          {
            key: 'logs',
            label: (
              <Space>
                <Terminal size={14} /> Logs
              </Space>
            ),
            children: <LogsViewer logRef={logRef} logs={logs} height={400} />
          }
        ]}
      />
    </Modal>
  )
}

const SavedDBQueryResultModal = withNotification(SavedDBQueryResultModalWOC)

export default SavedDBQueryResultModal
