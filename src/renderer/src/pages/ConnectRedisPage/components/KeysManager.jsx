import {
  Input,
  Row,
  Col,
  Space,
  Button,
  Table,
  Popconfirm,
  Tooltip,
  Modal,
  Alert,
  Typography
} from 'antd'
import { Terminal as TerminalIcon, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { runRedisCommand } from '../services/redisService'
import KeyDetailsModal from './KeyDetailsModal'

const { Text } = Typography

const KeysManager = ({
  context,
  renderErrorNotification,
  renderSuccessNotification,
  query,
  setQuery
}) => {
  const [loading, setLoading] = useState(false)
  const [keysData, setKeysData] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [keyFilter, setKeyFilter] = useState('')
  const [searchPattern, setSearchPattern] = useState('*')
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)

  const fetchKeys = async (pattern = '*') => {
    setLoading(true)
    try {
      const output = await runRedisCommand(`keys '${pattern}'`, context)
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
      await runRedisCommand(query, context)
      setQuery('')
      // If user ran a command that might change keys, refresh table
      if (query.toUpperCase().includes('SET') || query.toUpperCase().includes('DEL')) {
        fetchKeys(searchPattern)
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
        await runRedisCommand(`DEL "${k}"`, context)
      }
      renderSuccessNotification({ message: `Deleted ${keysToDelete.length} key(s)` })
      setSelectedRowKeys([])
      fetchKeys(searchPattern)
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const openKeyDetails = (key) => {
    setSelectedKey(key)
    setDetailModalOpen(true)
  }

  const columns = [
    { title: 'Key Name', dataIndex: 'key', key: 'key', render: (text) => <Text code>{text}</Text> },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            title="Delete Key"
            description={`Are you sure you want to delete ${record.key}?`}
            onConfirm={() => handleDeleteKeys([record.key])}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <Tooltip title="Delete Key">
              <Button type="text" danger icon={<Trash2 size={16} />} />
            </Tooltip>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
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

      <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space>
              <Input.Search
                placeholder="Key pattern (e.g. user:*)"
                value={searchPattern}
                onChange={(e) => setSearchPattern(e.target.value)}
                onSearch={(val) => fetchKeys(val || '*')}
                style={{ width: 250 }}
                enterButton="Search Keys"
              />
              <Button onClick={() => fetchKeys('*')} loading={loading}>
                Get All
              </Button>
              <Button
                danger
                icon={<Trash2 size={16} />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => setBulkDeleteModalOpen(true)}
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
            onClick: () => openKeyDetails(record.key),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      <KeyDetailsModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        redisKey={selectedKey}
        context={context}
        renderErrorNotification={renderErrorNotification}
      />

      <Modal
        title={
          <Space>
            <Trash2 size={18} color="#ff4d4f" />
            <Text strong>Delete {selectedRowKeys.length} Keys?</Text>
          </Space>
        }
        open={bulkDeleteModalOpen}
        onOk={() => {
          const keys = keysData
            .filter((item) => selectedRowKeys.includes(item.id))
            .map((item) => item.key)
          handleDeleteKeys(keys)
          setBulkDeleteModalOpen(false)
        }}
        onCancel={() => setBulkDeleteModalOpen(false)}
        okText="Yes, Delete"
        okButtonProps={{ danger: true, loading: loading }}
        cancelText="Cancel"
      >
        <Alert
          type="warning"
          showIcon
          message={`Are you sure you want to delete ${selectedRowKeys.length} selected key(s)? This action cannot be undone.`}
        />
      </Modal>
    </>
  )
}

export default KeysManager
