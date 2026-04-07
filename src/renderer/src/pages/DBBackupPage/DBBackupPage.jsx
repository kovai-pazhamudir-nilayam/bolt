import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd'
import { Download, PenLine, Pencil, Plus, RefreshCw, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import { dbBackupFactory } from '../../repos/DBBackupPage.repo'

const { dbBackupRepo } = dbBackupFactory()
const { Text } = Typography

const getRowKey = (record) => (record.id !== undefined ? record.id : JSON.stringify(record))

const getColumns = (records) => {
  if (!records || records.length === 0) return []
  return Object.keys(records[0]).map((key) => ({
    title: key,
    dataIndex: key,
    key,
    ellipsis: true,
    width: 140,
    render: (val) =>
      val === null || val === undefined ? <Text type="secondary">null</Text> : String(val)
  }))
}

const DBBackupPage = ({ renderSuccessNotification }) => {
  const [tables, setTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)

  // Which tables are checked for export
  const [selectedTables, setSelectedTables] = useState([])

  // Active table shown in record panel
  const [activeTable, setActiveTable] = useState(null)

  // { tableName: records[] }
  const [tableData, setTableData] = useState({})
  const [loadingRecords, setLoadingRecords] = useState(false)

  // { tableName: { keys: [], records: [] } } — row selections per table
  const [tableSelections, setTableSelections] = useState({})

  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  // Manual entry
  const [manualTable, setManualTable] = useState(null)
  const [schema, setSchema] = useState([])
  const [loadingSchema, setLoadingSchema] = useState(false)
  const [manualRecords, setManualRecords] = useState([])
  const [loadingManualRecords, setLoadingManualRecords] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null) // null = Add mode, record = Edit mode
  const [saving, setSaving] = useState(false)
  const [manualForm] = Form.useForm()

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setLoadingTables(true)
    const result = await dbBackupRepo.getTables()
    setTables(result)
    setLoadingTables(false)
  }

  const loadTableRecords = async (tableName) => {
    setLoadingRecords(true)
    const records = await dbBackupRepo.getTableRecords(tableName)
    setTableData((prev) => ({ ...prev, [tableName]: records }))
    // Default: all records selected
    setTableSelections((prev) => ({
      ...prev,
      [tableName]: {
        keys: records.map(getRowKey),
        records
      }
    }))
    setLoadingRecords(false)
  }

  const handleTableCheck = (tableName, checked) => {
    if (checked) {
      setSelectedTables((prev) => [...prev, tableName])
      if (!tableData[tableName]) loadTableRecords(tableName)
      if (!activeTable) setActiveTable(tableName)
    } else {
      setSelectedTables((prev) => prev.filter((t) => t !== tableName))
    }
  }

  const handleTableClick = (tableName) => {
    setActiveTable(tableName)
    if (!tableData[tableName]) loadTableRecords(tableName)
  }

  const handleSelectAll = () => {
    setSelectedTables(tables)
    tables.forEach((t) => {
      if (!tableData[t]) loadTableRecords(t)
    })
    if (!activeTable && tables.length) setActiveTable(tables[0])
  }

  const handleExport = async () => {
    if (!selectedTables.length) return
    setExporting(true)
    const payload = selectedTables.map((name) => ({
      name,
      records: tableSelections[name]?.records || tableData[name] || []
    }))
    const result = await dbBackupRepo.exportBackup({ tables: payload })
    setExporting(false)
    if (result.canceled) return
    if (result.success) {
      renderSuccessNotification({ message: 'Backup exported', description: result.path })
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setImportResult(null)
    const result = await dbBackupRepo.importBackup()
    setImporting(false)
    if (result.canceled) return
    if (result.success) {
      setImportResult(result)
      renderSuccessNotification({
        message: 'Import complete',
        description: `${result.totalInserted} records imported`
      })
    }
  }

  const loadManualRecords = async (tableName) => {
    setLoadingManualRecords(true)
    const records = await dbBackupRepo.getTableRecords(tableName)
    setManualRecords(records)
    setLoadingManualRecords(false)
  }

  const handleManualTableSelect = async (tableName) => {
    setManualTable(tableName)
    setSchema([])
    setManualRecords([])
    manualForm.resetFields()
    setLoadingSchema(true)
    const [cols] = await Promise.all([
      dbBackupRepo.getTableSchema(tableName),
      loadManualRecords(tableName)
    ])
    setSchema(cols)
    setLoadingSchema(false)
  }

  // Build WHERE clause using PK columns from schema
  const buildWhere = (record) => {
    const pkCols = schema.filter((c) => c.pk > 0)
    if (pkCols.length === 0) return record // fallback: match all fields
    return Object.fromEntries(pkCols.map((c) => [c.name, record[c.name]]))
  }

  const handleManualSave = async (values) => {
    setSaving(true)
    if (editingRecord) {
      await dbBackupRepo.updateRecord({ tableName: manualTable, where: buildWhere(editingRecord), record: values })
      renderSuccessNotification({ message: 'Record updated', description: `Updated in ${manualTable}` })
    } else {
      await dbBackupRepo.insertRecord({ tableName: manualTable, record: values })
      renderSuccessNotification({ message: 'Record created', description: `Inserted into ${manualTable}` })
    }
    setSaving(false)
    manualForm.resetFields()
    setEditingRecord(null)
    setModalOpen(false)
    loadManualRecords(manualTable)
  }

  const handleManualDelete = async (record) => {
    await dbBackupRepo.deleteRecord({ tableName: manualTable, where: buildWhere(record) })
    renderSuccessNotification({ message: 'Record deleted', description: `Deleted from ${manualTable}` })
    loadManualRecords(manualTable)
  }

  const handleEditClick = (record) => {
    setEditingRecord(record)
    // Only set editable fields (skip auto cols)
    const editableValues = Object.fromEntries(
      schema.filter((c) => !isAutoCol(c)).map((c) => [c.name, record[c.name]])
    )
    manualForm.setFieldsValue(editableValues)
    setModalOpen(true)
  }

  const activeRecords = tableData[activeTable] || []
  const activeSelection = tableSelections[activeTable] || { keys: [], records: [] }

  const totalSelectedRecords = selectedTables.reduce(
    (sum, name) => sum + (tableSelections[name]?.records.length ?? tableData[name]?.length ?? 0),
    0
  )

  const exportTab = (
    <Card
      bordered={false}
      extra={
        <Button
          type="primary"
          icon={<Download size={16} />}
          loading={exporting}
          disabled={!selectedTables.length}
          onClick={handleExport}
        >
          Download JSON
          {selectedTables.length > 0 &&
            ` (${selectedTables.length} tables · ${totalSelectedRecords} rows)`}
        </Button>
      }
    >
      <Row gutter={16}>
        {/* Table list */}
        <Col span={6}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <Text strong>Tables</Text>
            <Button
              type="link"
              size="small"
              loading={loadingTables}
              icon={<RefreshCw size={12} />}
              onClick={loadTables}
            />
          </div>
          <div
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              maxHeight: 420,
              overflowY: 'auto'
            }}
          >
            {tables.map((name) => (
              <div
                key={name}
                onClick={() => handleTableClick(name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  background: activeTable === name ? '#e6f4ff' : 'transparent',
                  borderLeft: activeTable === name ? '3px solid #1677ff' : '3px solid transparent'
                }}
              >
                <Checkbox
                  checked={selectedTables.includes(name)}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleTableCheck(name, e.target.checked)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ marginLeft: 8, flex: 1, fontSize: 13 }}>{name}</span>
                {tableSelections[name] && (
                  <Tag color="blue" style={{ fontSize: 11, marginLeft: 4 }}>
                    {tableSelections[name].records.length}
                  </Tag>
                )}
              </div>
            ))}
          </div>
          <Space style={{ marginTop: 8 }}>
            <Button size="small" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button size="small" onClick={() => setSelectedTables([])}>
              Clear
            </Button>
          </Space>
        </Col>

        {/* Record panel */}
        <Col span={18}>
          {activeTable ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{activeTable}</Text>
                <Tag>
                  {activeSelection.records.length} / {activeRecords.length} rows selected
                </Tag>
                <Button
                  size="small"
                  onClick={() =>
                    setTableSelections((prev) => ({
                      ...prev,
                      [activeTable]: { keys: activeRecords.map(getRowKey), records: activeRecords }
                    }))
                  }
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    setTableSelections((prev) => ({
                      ...prev,
                      [activeTable]: { keys: [], records: [] }
                    }))
                  }
                >
                  Clear
                </Button>
              </div>
              <Table
                size="small"
                rowKey={getRowKey}
                dataSource={activeRecords}
                columns={getColumns(activeRecords)}
                loading={loadingRecords}
                scroll={{ x: 'max-content', y: 360 }}
                rowSelection={{
                  selectedRowKeys: activeSelection.keys,
                  onChange: (keys, rows) =>
                    setTableSelections((prev) => ({
                      ...prev,
                      [activeTable]: { keys, records: rows }
                    }))
                }}
                pagination={{ pageSize: 20, showSizeChanger: false, size: 'small' }}
              />
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                color: '#999',
                border: '1px dashed #d9d9d9',
                borderRadius: 6
              }}
            >
              Click a table on the left to preview and select records
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )

  const importTab = (
    <Card bordered={false}>
      <Button icon={<Upload size={16} />} loading={importing} onClick={handleImport}>
        Open Backup File & Restore
      </Button>
      <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
        Existing records with the same ID are skipped (no overwrite).
      </Text>

      {importResult && (
        <div style={{ marginTop: 16 }}>
          <Alert
            type="success"
            message={`Import complete — ${importResult.totalInserted} records processed`}
            style={{ marginBottom: 12 }}
          />
          <Table
            size="small"
            dataSource={importResult.results}
            rowKey="table"
            pagination={false}
            columns={[
              { title: 'Table', dataIndex: 'table', key: 'table' },
              { title: 'Records', dataIndex: 'inserted', key: 'inserted' },
              {
                title: 'Status',
                key: 'status',
                render: (_, r) =>
                  r.skipped ? (
                    <Tag color="orange">Skipped — {r.reason}</Tag>
                  ) : (
                    <Tag color="green">OK</Tag>
                  )
              }
            ]}
          />
        </div>
      )}
    </Card>
  )

  // Columns that are auto-managed — skip in manual form
  const isAutoCol = (col) =>
    (col.pk === 1 && col.type.toUpperCase().includes('INT')) ||
    col.name === 'created_at' ||
    col.name === 'updated_at'

  const renderField = (col) => {
    const type = col.type.toUpperCase()
    if (type.includes('INT'))
      return <InputNumber style={{ width: '100%' }} placeholder={col.dflt_value ?? ''} />
    if (type.includes('REAL') || type.includes('FLOAT') || type.includes('NUMERIC'))
      return (
        <InputNumber step={0.01} style={{ width: '100%' }} placeholder={col.dflt_value ?? ''} />
      )
    const longNames = ['content', 'description', 'body', 'notes', 'text', 'message', 'query']
    if (longNames.some((f) => col.name.toLowerCase().includes(f)))
      return <Input.TextArea rows={3} placeholder={col.dflt_value ?? ''} />
    return <Input placeholder={col.dflt_value ?? ''} />
  }

  const manualEntryTab = (
    <Card bordered={false}>
      <Row gutter={16}>
        {/* Table list */}
        <Col span={6}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <Text strong>Tables</Text>
            <Button
              type="link"
              size="small"
              loading={loadingTables}
              icon={<RefreshCw size={12} />}
              onClick={loadTables}
            />
          </div>
          <div
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              maxHeight: 480,
              overflowY: 'auto'
            }}
          >
            {tables.map((name) => (
              <div
                key={name}
                onClick={() => handleManualTableSelect(name)}
                style={{
                  padding: '7px 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  background: manualTable === name ? '#e6f4ff' : 'transparent',
                  borderLeft: manualTable === name ? '3px solid #1677ff' : '3px solid transparent'
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </Col>

        {/* Records panel */}
        <Col span={18}>
          {manualTable ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12
                }}
              >
                <Space>
                  <Text strong>{manualTable}</Text>
                  <Tag>{manualRecords.length} records</Tag>
                </Space>
                <Button
                  type="primary"
                  icon={<Plus size={14} />}
                  disabled={loadingSchema || schema.filter((c) => !isAutoCol(c)).length === 0}
                  onClick={() => {
                    setEditingRecord(null)
                    manualForm.resetFields()
                    setModalOpen(true)
                  }}
                >
                  Add New Record
                </Button>
              </div>
              <Table
                size="small"
                rowKey={getRowKey}
                dataSource={manualRecords}
                columns={[
                  ...getColumns(manualRecords),
                  {
                    title: '',
                    key: '_actions',
                    fixed: 'right',
                    width: 80,
                    render: (_, record) => (
                      <Space size={4}>
                        <Button
                          type="text"
                          size="small"
                          icon={<Pencil size={13} />}
                          onClick={() => handleEditClick(record)}
                        />
                        <Popconfirm
                          title="Delete this record?"
                          onConfirm={() => handleManualDelete(record)}
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                        >
                          <Button type="text" danger size="small" icon={<Trash2 size={13} />} />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
                loading={loadingManualRecords}
                scroll={{ x: 'max-content', y: 380 }}
                pagination={{ pageSize: 20, showSizeChanger: false, size: 'small' }}
                locale={{ emptyText: 'No records yet' }}
              />
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                color: '#999',
                border: '1px dashed #d9d9d9',
                borderRadius: 6
              }}
            >
              Select a table on the left to view records and add new entries
            </div>
          )}
        </Col>
      </Row>

      <Modal
        title={`${editingRecord ? 'Edit' : 'Add'} Record — ${manualTable}`}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null) }}
        footer={null}
        width={560}
        destroyOnClose
      >
        {schema.filter((c) => !isAutoCol(c)).length > 0 ? (
          <Form
            form={manualForm}
            layout="vertical"
            onFinish={handleManualSave}
            style={{ marginTop: 8 }}
          >
            {schema
              .filter((col) => !isAutoCol(col))
              .map((col) => (
                <Form.Item
                  key={col.name}
                  name={col.name}
                  label={col.name}
                  rules={[
                    {
                      required: col.notnull === 1 && col.dflt_value === null,
                      message: `${col.name} is required`
                    }
                  ]}
                >
                  {renderField(col)}
                </Form.Item>
              ))}
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => { setModalOpen(false); setEditingRecord(null) }}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <Alert type="warning" message="No editable columns found for this table." />
        )}
      </Modal>
    </Card>
  )

  return (
    <div>
      <PageHeader
        title="DB Backup"
        description="Export selected tables and records to JSON, or restore from a backup file."
      />
      <Tabs
        defaultActiveKey="export"
        items={[
          {
            key: 'export',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14} /> Download
              </span>
            ),
            children: exportTab
          },
          {
            key: 'import',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Upload size={14} /> Upload
              </span>
            ),
            children: importTab
          },
          {
            key: 'manual',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PenLine size={14} /> Manual Entry
              </span>
            ),
            children: manualEntryTab
          }
        ]}
      />
    </div>
  )
}

export default withNotification(DBBackupPage)
