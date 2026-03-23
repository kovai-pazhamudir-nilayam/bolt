import { Button, Col, Form, Modal, Row, Space, Tabs } from 'antd'
import { DataGrid } from 'react-data-grid'
import 'react-data-grid/lib/styles.css'
import SelectFormItem from '../../../components/SelectFormItem'
import { Download, Play, TableIcon, Terminal } from 'lucide-react'
import LogsViewer from '../../../components/LogsViewer/LogsViewer'
import withNotification from '../../../hoc/withNotification'
import { shellFactory } from '../../../repos/shell.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import { useRef, useState, useMemo } from 'react'

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
  const [sortColumns, setSortColumns] = useState([])
  const [filters, setFilters] = useState({})
  const { shellRepo } = shellFactory()
  const { gcpProjectConfigRepo } = settingsFactory()

  const parsePsqlCsv = (output) => {
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
      key: h,
      name: h,
      resizable: true,
      sortable: true,
      minWidth: 100
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
  }

  const gridColumns = useMemo(() => {
    return (queryResult?.columns || []).map((col) => ({
      ...col,
      renderHeaderCell: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span>{col.name}</span>
          <input
            style={{ width: '100%', fontSize: 11, padding: '1px 4px', boxSizing: 'border-box' }}
            placeholder="Filter..."
            value={filters[col.key] || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )
    }))
  }, [queryResult, filters])

  const displayRows = useMemo(() => {
    let rows = queryResult?.dataSource || []

    Object.entries(filters).forEach(([key, val]) => {
      if (val)
        rows = rows.filter((r) =>
          String(r[key] ?? '')
            .toLowerCase()
            .includes(val.toLowerCase())
        )
    })

    if (sortColumns.length > 0) {
      const { columnKey, direction } = sortColumns[0]
      rows = [...rows].sort((a, b) => {
        const cmp = String(a[columnKey] ?? '').localeCompare(String(b[columnKey] ?? ''))
        return direction === 'ASC' ? cmp : -cmp
      })
    }

    return rows
  }, [queryResult, sortColumns, filters])

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
    setSortColumns([])
    setFilters({})
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

  const gridHeight = 'calc(100vh - 260px)'

  return (
    <Modal
      title={`Run: ${queryToRun?.title}`}
      open
      onCancel={() => setIsRunModalOpen(false)}
      footer={null}
      width="100vw"
      style={{ top: 0, margin: 0, maxWidth: '100vw', paddingBottom: 0 }}
      styles={{
        content: { borderRadius: 0, height: '100vh' },
        body: { padding: '16px 24px', overflow: 'hidden' }
      }}
    >
      <Form form={runForm} onFinish={onRunSubmit} layout="vertical" style={{ flexShrink: 0 }}>
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
        style={{ marginTop: 8 }}
        tabBarExtraContent={
          queryResult && (
            <Button size="small" icon={<Download size={14} />} onClick={() => downloadCSV(queryResult)}>
              Download CSV
            </Button>
          )
        }
        items={[
          {
            key: 'results',
            label: (
              <Space>
                <TableIcon size={14} /> Results
              </Space>
            ),
            children: (
              <DataGrid
                columns={gridColumns}
                rows={displayRows}
                rowKeyGetter={(row) => row.key}
                sortColumns={sortColumns}
                onSortColumnsChange={setSortColumns}
                defaultColumnOptions={{ resizable: true }}
                style={{ height: gridHeight, blockSize: gridHeight }}
              />
            )
          },
          {
            key: 'logs',
            label: (
              <Space>
                <Terminal size={14} /> Logs
              </Space>
            ),
            children: <LogsViewer logRef={logRef} logs={logs} height={gridHeight} />
          }
        ]}
      />
    </Modal>
  )
}

const SavedDBQueryResultModal = withNotification(SavedDBQueryResultModalWOC)

export default SavedDBQueryResultModal
