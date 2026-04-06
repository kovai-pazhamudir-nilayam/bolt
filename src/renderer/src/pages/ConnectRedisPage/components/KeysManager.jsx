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
  Typography,
  Tag,
  Spin,
  theme
} from 'antd'
import { Terminal as TerminalIcon, Search, Trash2, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { runRedisCommand } from '../services/redisService'
import { decodeJWT, formatTTL } from '../utils/redisUtils'

const { Text } = Typography
const { useToken } = theme

const getCleanOutput = (raw, firstLineOnly = false) => {
  const lines = (raw || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('Starting command'))
  return firstLineOnly ? lines[0] || '' : lines.join('\n')
}

const KeyDetailModal = ({ open, onClose, redisKey, context, renderErrorNotification }) => {
  const { token } = useToken()
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)
  const [showDecoded, setShowDecoded] = useState(false)

  useEffect(() => {
    if (!open || !redisKey) return
    setInfo(null)
    setShowDecoded(false)
    setLoading(true)
    const fetch = async () => {
      try {
        const type =
          getCleanOutput(
            await runRedisCommand(`TYPE "${redisKey}"`, context),
            true
          ).toLowerCase() || 'unknown'
        const ttl =
          getCleanOutput(await runRedisCommand(`TTL "${redisKey}"`, context), true) || '-1'
        let value = ''
        if (type === 'string')
          value = getCleanOutput(await runRedisCommand(`GET "${redisKey}"`, context))
        else if (type === 'hash')
          value = getCleanOutput(await runRedisCommand(`HGETALL "${redisKey}"`, context))
        else if (type === 'list')
          value = getCleanOutput(await runRedisCommand(`LRANGE "${redisKey}" 0 -1`, context))
        else if (type === 'set')
          value = getCleanOutput(await runRedisCommand(`SMEMBERS "${redisKey}"`, context))
        else if (type === 'zset')
          value = getCleanOutput(await runRedisCommand(`ZRANGE "${redisKey}" 0 -1`, context))
        setInfo({ type, ttl, value: value || '(empty)' })
      } catch {
        renderErrorNotification({ message: `Failed to fetch details for ${redisKey}` })
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [open, redisKey])

  const jwt = info ? decodeJWT(info.value) : null

  return (
    <Modal
      title={
        <Text strong style={{ fontFamily: 'monospace' }}>
          {redisKey}
        </Text>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Spin spinning={loading}>
        <Space style={{ marginBottom: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
              TYPE
            </Text>
            <Tag color="blue">{info?.type || '...'}</Tag>
          </div>
          <div style={{ marginLeft: 24 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
              TTL
            </Text>
            <Tag color={info && parseInt(info.ttl) < 0 ? 'default' : 'orange'}>
              {info ? formatTTL(info.ttl) : '...'}
            </Tag>
          </div>

          {info && parseInt(info.ttl) > 0 && (
            <div style={{ marginLeft: 24 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                EXPIRES AT
              </Text>
              <Text style={{ fontSize: 12 }}>
                {new Date(Date.now() + parseInt(info.ttl) * 1000).toLocaleString()}
              </Text>
            </div>
          )}
        </Space>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
          VALUE
        </Text>
        <div
          style={{
            background: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadius,
            padding: '10px 14px',
            fontFamily: 'monospace',
            fontSize: 13,
            maxHeight: 400,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {showDecoded ? (
            <>
              <Text
                style={{
                  fontSize: 11,
                  color: token.colorPrimary,
                  display: 'block',
                  marginBottom: 4
                }}
              >
                Decoded JWT
              </Text>
              <pre style={{ margin: 0 }}>{JSON.stringify(jwt, null, 2)}</pre>
              <Button size="small" style={{ marginTop: 8 }} onClick={() => setShowDecoded(false)}>
                Show Raw
              </Button>
            </>
          ) : (
            <>
              {info?.value}
              {jwt && (
                <Button
                  size="small"
                  type="primary"
                  icon={<ExternalLink size={12} />}
                  style={{ marginTop: 8, display: 'block' }}
                  onClick={() => setShowDecoded(true)}
                >
                  Decode JWT
                </Button>
              )}
            </>
          )}
        </div>
      </Spin>
    </Modal>
  )
}

const KeysManager = ({
  context,
  renderErrorNotification,
  renderSuccessNotification,
  query,
  setQuery
}) => {
  const { token } = useToken()
  const [buttonLoading, setButtonLoading] = useState(false)
  const [keysData, setKeysData] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [keyFilter, setKeyFilter] = useState('')
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)
  const [detailKey, setDetailKey] = useState(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState([])

  const parseKeys = (output) =>
    (output || '')
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k && !k.startsWith('Starting command'))

  const fetchKeys = async () => {
    setButtonLoading(true)
    try {
      const output = await runRedisCommand('keys *', context)
      const keys = parseKeys(output)
      if (keys.length === 0) {
        renderErrorNotification({ message: 'No keys found' })
        return
      }
      setKeysData(keys.map((k, i) => ({ key: k, id: i })))
    } catch {
      renderErrorNotification({ message: 'Failed to fetch keys' })
    } finally {
      setButtonLoading(false)
    }
  }

  const handleManualQuery = async () => {
    if (!query.trim()) return
    setButtonLoading(true)
    const isKeysCmd = query.trim().toUpperCase().startsWith('KEYS')
    try {
      const result = await runRedisCommand(query, context)
      const lines = parseKeys(result)

      if (isKeysCmd) {
        if (lines.length === 0) {
          renderErrorNotification({ message: 'No keys found matching that pattern' })
        } else {
          setKeysData(lines.map((k, i) => ({ key: k, id: i })))
          setKeyFilter('')
          setExpandedRowKeys([])
        }
      } else {
        if (query.toUpperCase().includes('SET') || query.toUpperCase().includes('DEL')) {
          await fetchKeys()
        }
      }
      setQuery('')
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setButtonLoading(false)
    }
  }

  const handleDeleteKeys = async (keysToDelete) => {
    setButtonLoading(true)
    try {
      for (const k of keysToDelete) {
        await runRedisCommand(`DEL "${k}"`, context)
      }
      renderSuccessNotification({ message: `Deleted ${keysToDelete.length} key(s)` })
      setSelectedRowKeys([])
      fetchKeys()
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setButtonLoading(false)
    }
  }

  const columns = [
    {
      title: 'Key Name',
      dataIndex: 'key',
      key: 'key',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            title="Delete Key"
            description={
              <span>
                Are you sure you want to delete
                <br />
                <code>{record.key}</code>?
              </span>
            }
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

  const filteredKeys = keysData.filter((item) =>
    item.key.toLowerCase().includes(keyFilter.toLowerCase())
  )

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Input.Search
          placeholder="Enter Redis command — KEYS populates table (e.g. KEYS Authn*)"
          enterButton="Execute"
          size="large"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={handleManualQuery}
          loading={buttonLoading}
          prefix={<TerminalIcon size={16} style={{ marginRight: 8 }} />}
        />
      </div>

      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          padding: 16,
          borderRadius: token.borderRadius
        }}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space>
              <Button type="primary" onClick={fetchKeys} loading={buttonLoading}>
                Load Keys
              </Button>
              <Input
                placeholder="Search loaded keys (e.g. Authn)"
                prefix={<Search size={14} />}
                value={keyFilter}
                onChange={(e) => setKeyFilter(e.target.value)}
                allowClear
                style={{ width: 260 }}
              />
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
        </Row>
        {keysData.length > 0 && (
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
            {filteredKeys.length} of {keysData.length} key{keysData.length !== 1 ? 's' : ''}
            {selectedRowKeys.length > 0 ? ` · ${selectedRowKeys.length} selected` : ''}
          </Text>
        )}
        <Table
          size="small"
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          columns={columns}
          dataSource={filteredKeys}
          rowKey="id"
          pagination={{ pageSize: 15 }}
          onRow={(record) => ({
            onClick: () => setDetailKey(record.key),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      <KeyDetailModal
        open={!!detailKey}
        onClose={() => setDetailKey(null)}
        redisKey={detailKey}
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
        okButtonProps={{ danger: true, loading: buttonLoading }}
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
