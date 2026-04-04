import { Card, Select, Space, Table, Tag, Typography } from 'antd'
import { Edit, Eye, EyeOff } from 'lucide-react'
import { ACCESS_OPTIONS, accessColor } from '../featureConfig.helpers'

const ACCESS_ICONS = { write: <Edit size={12} />, read: <Eye size={12} />, hidden: <EyeOff size={12} /> }
const accessIcon = (v) => ACCESS_ICONS[v] || null

const { Text } = Typography

const FeatureTable = ({ features, loading, onAccessChange }) => {
  const columns = [
    {
      title: 'Feature',
      dataIndex: 'feature_name',
      key: 'feature_name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.feature_key}
          </Text>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'feature_type',
      key: 'feature_type',
      width: 90,
      render: (type) => (
        <Tag color={type === 'page' ? 'geekblue' : 'cyan'}>{(type || 'page').toUpperCase()}</Tag>
      )
    },
    {
      title: 'Access',
      dataIndex: 'access_level',
      key: 'access_level',
      width: 160,
      render: (level, record) => (
        <Select
          value={level || 'write'}
          size="small"
          style={{ width: 140 }}
          onChange={(v) => onAccessChange(record.feature_key, v)}
        >
          {ACCESS_OPTIONS.map((o) => (
            <Select.Option key={o.value} value={o.value}>
              <Space size={4}>
                {o.icon}
                {o.label}
              </Space>
            </Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const v = record.access_level || 'write'
        return (
          <Tag color={accessColor(v)} icon={accessIcon(v)}>
            {v.toUpperCase()}
          </Tag>
        )
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <Text type="secondary">—</Text>
    }
  ]

  return (
    <Card style={{ marginBottom: 16 }}>
      <Table
        columns={columns}
        dataSource={features}
        rowKey="feature_key"
        loading={loading}
        pagination={false}
        size="small"
      />
    </Card>
  )
}

export default FeatureTable
