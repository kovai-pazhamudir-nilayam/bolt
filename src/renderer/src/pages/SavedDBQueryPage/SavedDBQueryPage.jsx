import { Button, Col, Form, Popconfirm, Row, Space, Table, Tooltip, Typography } from 'antd'
import { Edit2, PlayCircle, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import { dbSecretsFactory } from '../../repos/DBSecretsPage.repo'
import { savedDbQueryFactory } from '../../repos/SavedDBQueryPage.repo'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import SavedDBQueryModal from './_blocks/SavedDBQueryModal'
import SavedDBQueryResultModal from './_blocks/SavedDBQueryResultModal'

const { Text } = Typography

const getSavedDBQueryColumns = ({
  datasource,
  handleRunModalOpen,
  handleOpenModal,
  handleDelete
}) => {
  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Database',
      key: 'db_name',
      render: (_, record) => {
        if (!record.db_name) return <Text type="danger">Not Set</Text>
        return `${record.db_name} (${record.company_code})`
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
  return columns
}

// Initialize repositories
const { companyRepo, environmentRepo } = settingsFactory()
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
    renderSuccessNotification({ message: 'Saved query successfully.' })
    setIsModalOpen(false)
    fetchData()
    setLoading(false)
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
        columns={getSavedDBQueryColumns({
          datasource,
          handleRunModalOpen,
          handleOpenModal,
          handleDelete
        })}
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
          datasource={datasource}
          loading={loading}
          queryResult={queryResult}
          logs={logs}
          setIsRunModalOpen={setIsRunModalOpen}
        />
      )}
    </div>
  )
}

const SavedDBQueryPage = withNotification(SavedDBQueryPageWOC)

export default SavedDBQueryPage
