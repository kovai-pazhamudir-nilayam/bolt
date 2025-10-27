import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Select, 
  Space, 
  Typography, 
  Card, 
  Switch, 
  message, 
  Modal, 
  Tag,
  Divider,
  Row,
  Col,
  Statistic
} from 'antd'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Edit, 
  Save, 
  RotateCcw,
  Settings,
  Lock,
  Unlock
} from 'lucide-react'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useFeatureConfig } from '../../context/featureConfigContext'

const { Title, Text } = Typography
const { Option } = Select

const FeatureConfigPage = () => {
  const {
    featureConfigs,
    loading,
    superadminMode,
    updateFeatureAccessLevel,
    resetFeatureConfigs,
    toggleSuperadminMode,
    isSuperadminOnlyFeature,
    loadFeatureConfigs
  } = useFeatureConfig()

  const [editingKey, setEditingKey] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [resetModalVisible, setResetModalVisible] = useState(false)

  // Filter features by type
  const filteredFeatures = featureConfigs.filter(feature => {
    if (selectedType === 'all') return true
    return feature.feature_type === selectedType
  })

  // Get statistics
  const stats = {
    total: featureConfigs.length,
    pages: featureConfigs.filter(f => f.feature_type === 'page').length,
    tabs: featureConfigs.filter(f => f.feature_type === 'tab').length,
    write: featureConfigs.filter(f => f.access_level === 'write').length,
    read: featureConfigs.filter(f => f.access_level === 'read').length,
    hidden: featureConfigs.filter(f => f.access_level === 'hidden').length,
    superadmin: featureConfigs.filter(f => f.is_superadmin_only).length
  }

  const handleAccessLevelChange = async (featureKey, newAccessLevel) => {
    try {
      await updateFeatureAccessLevel(featureKey, newAccessLevel)
      message.success(`Feature access level updated to ${newAccessLevel}`)
      setEditingKey('')
    } catch (error) {
      message.error('Failed to update feature access level')
      console.error(error)
    }
  }

  const handleReset = async () => {
    try {
      await resetFeatureConfigs()
      message.success('All feature configurations have been reset to default')
      setResetModalVisible(false)
    } catch (error) {
      message.error('Failed to reset feature configurations')
      console.error(error)
    }
  }

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'write': return 'green'
      case 'read': return 'orange'
      case 'hidden': return 'red'
      default: return 'default'
    }
  }

  const getAccessLevelIcon = (level) => {
    switch (level) {
      case 'write': return <Edit size={14} />
      case 'read': return <Eye size={14} />
      case 'hidden': return <EyeOff size={14} />
      default: return null
    }
  }

  const columns = [
    {
      title: 'Feature Name',
      dataIndex: 'feature_name',
      key: 'feature_name',
      render: (text, record) => (
        <Space>
          {text}
          {isSuperadminOnlyFeature(record.feature_key) && (
            <Tag color="purple" icon={<Shield size={12} />}>
              Superadmin
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Feature Key',
      dataIndex: 'feature_key',
      key: 'feature_key',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'feature_type',
      key: 'feature_type',
      render: (type) => (
        <Tag color={type === 'page' ? 'blue' : 'cyan'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Current Access Level',
      dataIndex: 'access_level',
      key: 'access_level',
      render: (level, record) => {
        if (editingKey === record.feature_key) {
          return (
            <Select
              defaultValue={level}
              style={{ width: 120 }}
              onChange={(value) => handleAccessLevelChange(record.feature_key, value)}
              onBlur={() => setEditingKey('')}
              autoFocus
            >
              <Option value="write">
                <Space>
                  <Edit size={14} />
                  Write
                </Space>
              </Option>
              <Option value="read">
                <Space>
                  <Eye size={14} />
                  Read
                </Space>
              </Option>
              <Option value="hidden">
                <Space>
                  <EyeOff size={14} />
                  Hidden
                </Space>
              </Option>
            </Select>
          )
        }

        return (
          <Tag 
            color={getAccessLevelColor(level)} 
            icon={getAccessLevelIcon(level)}
            style={{ cursor: 'pointer' }}
            onClick={() => setEditingKey(record.feature_key)}
          >
            {level.toUpperCase()}
          </Tag>
        )
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <Text type="secondary">No description</Text>
    }
  ]

  return (
    <div>
      <PageHeader
        title="Feature Configuration"
        description="Manage feature access levels and permissions. Control which features users can access and their level of interaction."
      />

      {/* Superadmin Mode Toggle */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Shield size={20} />
              <div>
                <Title level={5} style={{ margin: 0 }}>Superadmin Mode</Title>
                <Text type="secondary">
                  {superadminMode 
                    ? 'All restrictions are bypassed' 
                    : 'Normal user mode - restrictions apply'
                  }
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Switch
              checked={superadminMode}
              onChange={toggleSuperadminMode}
              checkedChildren={<Lock size={14} />}
              unCheckedChildren={<Unlock size={14} />}
            />
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic title="Total Features" value={stats.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Pages" value={stats.pages} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Tabs" value={stats.tabs} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Write Access" value={stats.write} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Read Only" value={stats.read} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Hidden" value={stats.hidden} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Filter by type:</Text>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: 120 }}
              >
                <Option value="all">All</Option>
                <Option value="page">Pages</Option>
                <Option value="tab">Tabs</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<RotateCcw size={16} />}
                onClick={() => setResetModalVisible(true)}
                danger
              >
                Reset All
              </Button>
              <Button 
                icon={<Settings size={16} />}
                onClick={loadFeatureConfigs}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Features Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredFeatures}
          rowKey="feature_key"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} features`
          }}
        />
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        title="Reset Feature Configurations"
        open={resetModalVisible}
        onOk={handleReset}
        onCancel={() => setResetModalVisible(false)}
        okText="Reset All"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to reset all feature configurations to their default values? 
          This will set all features to "write" access level.
        </p>
        <Text type="secondary">
          This action cannot be undone.
        </Text>
      </Modal>
    </div>
  )
}

export default FeatureConfigPage
