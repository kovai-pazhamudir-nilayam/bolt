import { Modal, Space, Typography, Descriptions, Tag, Button } from 'antd'
import { Info, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { runRedisCommand } from '../services/redisService'
import { decodeJWT, formatTTL } from '../utils/redisUtils'

const { Text } = Typography

const KeyDetailsModal = ({ open, onClose, redisKey, context, renderErrorNotification }) => {
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState({ type: '', ttl: '', value: '' })
  const [showDecoded, setShowDecoded] = useState(false)

  const fetchKeyDetails = async (key) => {
    setLoading(true)
    setShowDecoded(false)
    try {
      const getCleanOutput = (raw, firstLineOnly = false) => {
        const lines = raw
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('Starting command'))
        return firstLineOnly ? lines[0] || '' : lines.join('\n')
      }

      const typeOutputRaw = await runRedisCommand(`TYPE "${key}"`, context)
      const type = getCleanOutput(typeOutputRaw, true).toLowerCase() || 'unknown'

      const ttlOutputRaw = await runRedisCommand(`TTL "${key}"`, context)
      const ttl = getCleanOutput(ttlOutputRaw, true) || '-1'

      let value = ''
      if (type === 'string') {
        const valOutputRaw = await runRedisCommand(`GET "${key}"`, context)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'hash') {
        const valOutputRaw = await runRedisCommand(`HGETALL "${key}"`, context)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'list') {
        const valOutputRaw = await runRedisCommand(`LRANGE "${key}" 0 -1`, context)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'set') {
        const valOutputRaw = await runRedisCommand(`SMEMBERS "${key}"`, context)
        value = getCleanOutput(valOutputRaw)
      } else if (type === 'zset') {
        const valOutputRaw = await runRedisCommand(`ZRANGE "${key}" 0 -1`, context)
        value = getCleanOutput(valOutputRaw)
      }

      setInfo({ type, ttl, value })
    } catch {
      renderErrorNotification({ message: 'Failed to fetch key details' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && redisKey) {
      fetchKeyDetails(redisKey)
    }
  }, [open, redisKey])

  return (
    <Modal
      title={
        <Space>
          <Info size={18} />
          <Text strong>{redisKey}</Text>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={1} size="small" loading={loading}>
        <Descriptions.Item label="Type">
          <Tag color="blue">{info.type || '...'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="TTL">
          <Tag color={info.ttl < 0 ? 'default' : 'orange'}>{formatTTL(info.ttl)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Value">
          <div
            style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 4,
              maxHeight: 400,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              position: 'relative'
            }}
          >
            {showDecoded ? (
              <div>
                <div style={{ marginBottom: 8, color: '#1890ff', fontWeight: 'bold' }}>
                  Decoded JWT:
                </div>
                <pre style={{ margin: 0 }}>{JSON.stringify(decodeJWT(info.value), null, 2)}</pre>
                <Button size="small" style={{ marginTop: 8 }} onClick={() => setShowDecoded(false)}>
                  Show Raw
                </Button>
              </div>
            ) : (
              <>
                {info.value || (loading ? 'Fetching...' : 'Empty')}
                {decodeJWT(info.value) && (
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
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

export default KeyDetailsModal
