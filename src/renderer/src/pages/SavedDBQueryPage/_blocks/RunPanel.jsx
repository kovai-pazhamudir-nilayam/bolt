import { Button, Empty, Form, Input, Select, Space, Tag, Typography } from 'antd'
import { Database, Download, Play, Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import withNotification from '../../../hoc/withNotification'
import { getJumpboxPod } from '../../../helpers/jumpbox.helper'
import { shellFactory } from '../../../repos/shell.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import { useEffect, useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

const { Text, Title } = Typography

const downloadCSV = (result, title) => {
  if (!result?.columns || !result?.dataSource) return
  const headers = result.columns
  const csvLines = [
    headers.join(','),
    ...result.dataSource.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? '')
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val
        })
        .join(',')
    )
  ]
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
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
  const columns = lines[0].split(',')
  if (columns.length < 1) return null

  const dataSource = lines.slice(1).map((line) => {
    const values = line.split(',')
    const row = {}
    columns.forEach((h, i) => {
      row[h] = values[i] || ''
    })
    return row
  })

  return { columns, dataSource }
}

const SortIcon = ({ sorted }) => {
  if (sorted === 'asc') return <ChevronUp size={12} />
  if (sorted === 'desc') return <ChevronDown size={12} />
  return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />
}

const ResultsTable = ({ queryResult }) => {
  const [scrollEl, setScrollEl] = useState(null)
  const [columnFilters, setColumnFilters] = useState([])
  const [sorting, setSorting] = useState([])

  const columns = useMemo(
    () =>
      (queryResult?.columns || []).map((h) => ({
        accessorKey: h,
        header: h,
        size: 150,
        minSize: 80
      })),
    [queryResult]
  )

  const table = useReactTable({
    data: queryResult?.dataSource || [],
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => 34,
    overscan: 20
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalHeight = rowVirtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0 ? totalHeight - virtualRows[virtualRows.length - 1].end : 0

  return (
    <div ref={setScrollEl} style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '100%' }}>
        <colgroup>
          {table.getHeaderGroups()[0]?.headers.map((header) => (
            <col key={header.id} style={{ width: header.getSize() }} />
          ))}
        </colgroup>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const col = header.column
                const filterValue = col.getFilterValue() || ''
                return (
                  <th
                    key={header.id}
                    style={{
                      padding: '6px 8px',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 12,
                      background: '#fafafa',
                      borderRight: '1px solid #f0f0f0',
                      borderBottom: '2px solid #f0f0f0',
                      userSelect: 'none',
                      width: header.getSize()
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        marginBottom: 4
                      }}
                      onClick={col.getToggleSortingHandler()}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}
                      >
                        {flexRender(col.columnDef.header, header.getContext())}
                      </span>
                      <SortIcon sorted={col.getIsSorted()} />
                    </div>
                    <Input
                      size="small"
                      prefix={<Search size={10} />}
                      suffix={
                        filterValue ? (
                          <X
                            size={10}
                            style={{ cursor: 'pointer' }}
                            onClick={() => col.setFilterValue('')}
                          />
                        ) : null
                      }
                      placeholder="Filter..."
                      value={filterValue}
                      onChange={(e) => col.setFilterValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 11 }}
                    />
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td colSpan={columns.length} style={{ height: paddingTop, padding: 0 }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <tr
                key={row.id}
                style={{ background: virtualRow.index % 2 === 0 ? 'transparent' : '#fafafa' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      padding: '5px 8px',
                      fontSize: 12,
                      borderRight: '1px solid #f0f0f0',
                      borderBottom: '1px solid #f0f0f0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: cell.column.getSize()
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td colSpan={columns.length} style={{ height: paddingBottom, padding: 0 }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const RunPanelWOC = ({ query, datasource, renderErrorNotification, renderSuccessNotification }) => {
  const [runForm] = Form.useForm()
  const [queryResult, setQueryResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { shellRepo } = shellFactory()
  const { gcpProjectConfigRepo } = settingsFactory()

  useEffect(() => {
    setQueryResult(null)
    runForm.resetFields()
  }, [query?.id, runForm])

  const onRunSubmit = async (values) => {
    setLoading(true)
    setQueryResult(null)

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

    const result = await shellRepo.run(command)

    if (result.code === 0) {
      const parsed = parsePsqlCsv(result.stdout || '')
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
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {queryResult ? (
          <ResultsTable queryResult={queryResult} />
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
