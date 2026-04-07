import { Alert, Button, Space, Table, Tag, Typography, message } from 'antd'
import { PlusCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { KNOWN_TAB_CONFIGS } from '../featureConfig.helpers'

const { Text } = Typography

const MissingConfigsPanel = ({ routes, featureConfigs, onAdded }) => {
  const ALL_KNOWN_CONFIGS = useMemo(() => {
    const pageConfigs = routes
      .filter((r) => !r.hideInMenu && r.path !== '/feature-config')
      .map((r) => ({
        feature_key: r.path.replace('/', ''),
        feature_name: r.label,
        feature_type: 'page',
        description: r.description || ''
      }))
    return [...pageConfigs, ...KNOWN_TAB_CONFIGS]
  }, [routes])
  const [adding, setAdding] = useState(false)

  const missingConfigs = useMemo(() => {
    const existingKeys = new Set(featureConfigs.map((fc) => fc.feature_key))
    return ALL_KNOWN_CONFIGS.filter((kc) => !existingKeys.has(kc.feature_key))
  }, [featureConfigs])

  if (missingConfigs.length === 0) return null

  const addOne = async (config) => {
    await window.featureConfigAPI.upsertFeatureConfig({
      ...config,
      access_level: 'write'
    })
    message.success(`Added config for "${config.feature_name}"`)
    onAdded()
  }

  const addAll = async () => {
    setAdding(true)
    for (const config of missingConfigs) {
      await window.featureConfigAPI.upsertFeatureConfig({
        ...config,
        access_level: 'write'
      })
    }
    message.success(`Added ${missingConfigs.length} missing config(s)`)
    setAdding(false)
    onAdded()
  }

  const columns = [
    {
      title: 'Feature Key',
      dataIndex: 'feature_key',
      key: 'feature_key',
      render: (key) => <Text code>{key}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'feature_name',
      key: 'feature_name'
    },
    {
      title: 'Type',
      dataIndex: 'feature_type',
      key: 'feature_type',
      width: 80,
      render: (type) => (
        <Tag color={type === 'page' ? 'geekblue' : 'cyan'}>{type.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <Text type="secondary">—</Text>
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button size="small" icon={<PlusCircle size={13} />} onClick={() => addOne(record)}>
          Add
        </Button>
      )
    }
  ]

  return (
    <Alert
      type="warning"
      style={{ marginBottom: 16 }}
      message={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>
            <strong>{missingConfigs.length}</strong> page/tab
            {missingConfigs.length > 1 ? 's have' : ' has'} no feature config — disabled by
            default
          </span>
          <Button
            size="small"
            type="primary"
            icon={<PlusCircle size={13} />}
            loading={adding}
            onClick={addAll}
          >
            Add All with Write access
          </Button>
        </Space>
      }
      description={
        <Table
          columns={columns}
          dataSource={missingConfigs}
          rowKey="feature_key"
          size="small"
          pagination={false}
          style={{ marginTop: 8 }}
        />
      }
    />
  )
}

export default MissingConfigsPanel
