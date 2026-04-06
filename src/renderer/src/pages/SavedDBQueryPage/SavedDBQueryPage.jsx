import { Button, Empty, Form, Input, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { Database, Edit2, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import withNotification from '../../hoc/withNotification'
import { dbSecretsFactory } from '../../repos/DBSecretsPage.repo'
import { savedDbQueryFactory } from '../../repos/SavedDBQueryPage.repo'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import SavedDBQueryModal from './_blocks/SavedDBQueryModal'
import RunPanel from './_blocks/RunPanel'

const { Text } = Typography

// App layout offsets:
//   Content margin-top 88px + padding 12px = 100px top
//   Content margin-bottom 24px + padding 12px + paddingBottom 28px = 64px bottom
//   Total: 164px
const PAGE_HEIGHT = 'calc(100vh - 164px)'

const { companyRepo, environmentRepo } = settingsFactory()
const { dbSecretsRepo } = dbSecretsFactory()
const { savedDbQueryRepo } = savedDbQueryFactory()

const QueryListItem = ({ query, selected, onSelect, onEdit, onDelete }) => (
  <div
    onClick={() => onSelect(query)}
    style={{
      padding: '11px 12px',
      cursor: 'pointer',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      borderLeft: `3px solid ${selected ? '#1677ff' : 'transparent'}`,
      background: selected ? 'rgba(22,119,255,0.05)' : 'transparent',
      transition: 'background 0.15s'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Text
        strong
        style={{ fontSize: 13, flex: 1, minWidth: 0 }}
        ellipsis={{ tooltip: query.title }}
      >
        {query.title}
      </Text>
      <Space size={0} onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
        <Tooltip title="Edit">
          <Button type="text" size="small" icon={<Edit2 size={13} />} onClick={() => onEdit(query)} />
        </Tooltip>
        <Popconfirm title="Delete this query?" onConfirm={() => onDelete(query.id)}>
          <Button type="text" size="small" danger icon={<Trash2 size={13} />} />
        </Popconfirm>
      </Space>
    </div>

    {query.description && (
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }} ellipsis>
        {query.description}
      </Text>
    )}

    {query.db_name && (
      <div style={{ marginTop: 5 }}>
        <Tag
          icon={<Database size={10} style={{ marginRight: 3 }} />}
          style={{ fontSize: 11, margin: 0 }}
          color="default"
        >
          {query.db_name} · {query.company_code}
        </Tag>
      </div>
    )}
  </div>
)

const SavedDBQueryPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [loading, setLoading] = useState(false)
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: [],
    allDbSecrets: [],
    savedQueries: []
  })
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [modalForm] = Form.useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [allCompanies, allEnvironments, allDbSecrets, savedQueries] = await Promise.all([
      companyRepo.getAll(),
      environmentRepo.getAll(),
      dbSecretsRepo.getAll(),
      savedDbQueryRepo.getAll()
    ])
    setDatasource({ companies: allCompanies, environments: allEnvironments, allDbSecrets, savedQueries })
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Keep selectedQuery in sync after re-fetch
  useEffect(() => {
    if (selectedQuery) {
      const updated = datasource.savedQueries.find((q) => q.id === selectedQuery.id)
      if (updated) setSelectedQuery(updated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasource.savedQueries])

  const filteredQueries = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return datasource.savedQueries
    return datasource.savedQueries.filter(
      (query) =>
        query.title?.toLowerCase().includes(q) ||
        query.description?.toLowerCase().includes(q) ||
        query.db_name?.toLowerCase().includes(q)
    )
  }, [datasource.savedQueries, search])

  const allDbOptions = useMemo(() => {
    const seen = new Set()
    return datasource.allDbSecrets
      .filter((db) => {
        const key = `${db.company_code}::${db.db_name}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((db) => ({
        label: `${db.db_name} (${db.company_code})`,
        value: `${db.company_code}::${db.db_name}`
      }))
  }, [datasource.allDbSecrets])

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      modalForm.setFieldsValue({
        title: record.title,
        description: record.description,
        query: record.query,
        db_key:
          record.company_code && record.db_name
            ? `${record.company_code}::${record.db_name}`
            : undefined
      })
    } else {
      setEditingId(null)
      modalForm.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleSaveQuery = async (values) => {
    setLoading(true)
    const { db_key, ...rest } = values
    const [company_code, db_name] = (db_key || '::').split('::')
    await savedDbQueryRepo.upsert({ ...rest, company_code, db_name, id: editingId })
    renderSuccessNotification({ message: 'Query saved.' })
    setIsModalOpen(false)
    await fetchData()
    setLoading(false)
  }

  const handleDelete = async (id) => {
    setLoading(true)
    await savedDbQueryRepo.delete(id)
    renderSuccessNotification({ message: 'Query deleted.' })
    if (selectedQuery?.id === id) setSelectedQuery(null)
    await fetchData()
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', height: PAGE_HEIGHT, overflow: 'hidden' }}>

      {/* ── Left panel: query list ── */}
      <div
        style={{
          width: 280,
          minWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
          height: '100%'
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong style={{ fontSize: 13 }}>Saved DB Queries</Text>
            <Button
              type="primary"
              size="small"
              icon={<Plus size={13} />}
              onClick={() => handleOpenModal()}
            >
              New
            </Button>
          </div>
          <Input
            prefix={<Search size={12} style={{ color: 'rgba(0,0,0,0.3)' }} />}
            placeholder="Search..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        {/* Query list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredQueries.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={search ? 'No matches' : 'No saved queries'}
              style={{ marginTop: 40 }}
            />
          ) : (
            filteredQueries.map((query) => (
              <QueryListItem
                key={query.id}
                query={query}
                selected={selectedQuery?.id === query.id}
                onSelect={setSelectedQuery}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: run + results ── */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }}>
        {selectedQuery ? (
          <RunPanel
            key={selectedQuery.id}
            query={selectedQuery}
            datasource={datasource}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: 0.4
            }}
          >
            <Database size={40} strokeWidth={1} />
            <Text type="secondary" style={{ fontSize: 13 }}>Select a query from the list</Text>
          </div>
        )}
      </div>

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
    </div>
  )
}

const SavedDBQueryPage = withNotification(SavedDBQueryPageWOC)

export default SavedDBQueryPage
