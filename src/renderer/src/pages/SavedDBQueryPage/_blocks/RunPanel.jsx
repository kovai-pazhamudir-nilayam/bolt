import { Button, Empty, Form, Select, Space, Tag, Typography } from 'antd'
import { DataGrid } from 'react-data-grid'
import 'react-data-grid/lib/styles.css'
import { Database, Download, Play } from 'lucide-react'
import withNotification from '../../../hoc/withNotification'
import { getJumpboxPod } from '../../../helpers/jumpbox.helper'
import { shellFactory } from '../../../repos/shell.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import { useEffect, useState, useMemo } from 'react'

const { Text, Title } = Typography

// Same offset as page container (100px top + 64px bottom = 164px)
// Plus: query-info header ~100px + run toolbar ~52px + borders ~4px = 156px extra
const GRID_HEIGHT = 'calc(100vh - 320px)'

const downloadCSV = (result, title) => {
  if (!result?.rawOutput) return
  const blob = new Blob([result.rawOutput], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${title || 'query'}_${new Date().toISOString()}.csv`
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const parsePsqlCsv = (output) => {
  const lines = output
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !l.match(/^\(\d+ row/) && !l.startsWith('--'))

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

const RunPanelWOC = ({ query, datasource, renderErrorNotification, renderSuccessNotification }) => {
  const [runForm] = Form.useForm()
  const [queryResult, setQueryResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sortColumns, setSortColumns] = useState([])
  const [filters, setFilters] = useState({})
  const { shellRepo } = shellFactory()
  const { gcpProjectConfigRepo } = settingsFactory()

  // Reset when selected query changes
  useEffect(() => {
    setQueryResult(null)
    setFilters({})
    setSortColumns([])
    runForm.resetFields()
  }, [query?.id, runForm])

  const gridColumns = useMemo(
    () =>
      (queryResult?.columns || []).map((col) => ({
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
      })),
    [queryResult, filters]
  )

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

  const onRunSubmit = async (values) => {
    setLoading(true)
    setQueryResult(null)
    setSortColumns([])
    setFilters({})

    const dbSecret = datasource.allDbSecrets.find(
      (db) =>
        db.company_code === query.company_code &&
        db.db_name === query.db_name &&
        db.environment === values.env_code
    )
    if (!dbSecret) {
      renderErrorNotification({
        message: `No DB secret for ${query.db_name} in selected environment.`
      })
      setLoading(false)
      return
    }

    const gcpConfig = await gcpProjectConfigRepo.getOne({
      company_code: query.company_code,
      env_code: values.env_code
    })
    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = gcpConfig
    if (!cluster || !region || !project) {
      renderErrorNotification({ message: 'Missing GCP config (cluster / region / project).' })
      setLoading(false)
      return
    }

    const gcloudResult = await shellRepo.run(
      `gcloud container clusters get-credentials ${cluster} --region ${region} --project ${project}`
    )
    if (gcloudResult.code !== 0) {
      renderErrorNotification({ message: 'Failed to get GCP credentials.' })
      setLoading(false)
      return
    }

    const jumpboxPod = await getJumpboxPod()
    if (!jumpboxPod) {
      renderErrorNotification({ message: 'No jumpbox pod found.' })
      setLoading(false)
      return
    }

    const { db_host: host, db_user: user, db_password: password, db_name: dbName } = dbSecret
    const escapedPassword = password.replace(/'/g, "'\\''")
    const escapedQuery = query.query.replace(/'/g, "'\\''")
    const psqlCmd = `PGPASSWORD='${escapedPassword}' psql -h ${host} -U ${user} ${dbName} -A -F , -q -c '${escapedQuery}'`
    const command = `kubectl exec ${jumpboxPod} -- sh -c "${psqlCmd.replace(/"/g, '\\"')}"`

    // Collect stdout locally for CSV parsing; footer receives all shell output via DevPanelContext
    let output = ''
    let procId = null
    const logUnsub = shellRepo.onLog((data) => {
      if (!procId && data.type === 'info' && data.output.includes(command)) procId = data.processId
      if (procId && data.processId !== procId) return
      if (data.type === 'stdout') output += data.output + '\n'
    })

    const result = await shellRepo.run(command)
    logUnsub()

    if (result.code === 0) {
      const parsed = parsePsqlCsv(output)
      if (parsed) {
        setQueryResult(parsed)
        renderSuccessNotification({ message: `${parsed.dataSource.length} row(s) returned` })
      }
    } else {
      renderErrorNotification({ message: `Query failed (exit code ${result.code})` })
    }
    setLoading(false)
  }

  const rowCount = queryResult?.dataSource?.length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Query info */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Title level={5} style={{ margin: 0, flex: 1, minWidth: 0 }} ellipsis>
            {query.title}
          </Title>
          <Tag
            icon={<Database size={11} style={{ marginRight: 3 }} />}
            color="blue"
            style={{ flexShrink: 0 }}
          >
            {query.db_name} · {query.company_code}
          </Tag>
        </div>
        {query.description && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {query.description}
          </Text>
        )}
        <div
          style={{
            marginTop: 8,
            padding: '6px 10px',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 5,
            fontFamily: 'monospace',
            fontSize: 12,
            color: 'rgba(0,0,0,0.55)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={query.query}
        >
          {query.query}
        </div>
      </div>

      {/* Run toolbar */}
      <div
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <Form form={runForm} onFinish={onRunSubmit} layout="inline" style={{ margin: 0 }}>
          <Form.Item
            name="env_code"
            label="Environment"
            rules={[{ required: true, message: 'Select an environment' }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder="Select environment"
              style={{ width: 200 }}
              options={datasource.environments.map((e) => ({
                value: e.env_code,
                label: e.env_name || e.env_code
              }))}
              loading={loading}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} icon={<Play size={14} />}>
              Run
            </Button>
          </Form.Item>
        </Form>

        {queryResult && (
          <Space style={{ marginLeft: 'auto' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {rowCount} row{rowCount !== 1 ? 's' : ''}
            </Text>
            <Button
              size="small"
              icon={<Download size={13} />}
              onClick={() => downloadCSV(queryResult, query.title)}
            >
              Download CSV
            </Button>
          </Space>
        )}
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {queryResult ? (
          <DataGrid
            columns={gridColumns}
            rows={displayRows}
            rowKeyGetter={(row) => row.key}
            sortColumns={sortColumns}
            onSortColumnsChange={setSortColumns}
            headerRowHeight={56}
            defaultColumnOptions={{ resizable: true }}
            style={{ height: GRID_HEIGHT, blockSize: GRID_HEIGHT }}
          />
        ) : (
          !loading && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Select an environment and click Run"
              style={{ marginTop: 48 }}
            />
          )
        )}
      </div>
    </div>
  )
}

const RunPanel = withNotification(RunPanelWOC)

export default RunPanel
