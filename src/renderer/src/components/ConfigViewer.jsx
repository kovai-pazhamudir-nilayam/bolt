import React, { useState, useEffect } from 'react'
import { Card, Button, Spin, Alert, Typography, Tag, Space, Tooltip, message } from 'antd'
import { ReloadOutlined, EditOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CopyOutlined } from '@ant-design/icons'
import { useMasterDataContext } from '../context/masterDataContext'
import { ConfigManager, configHelpers } from '../helpers/configManager.helper'

const { Title, Text } = Typography

const ConfigViewer = () => {
  const { brand, environment, configs, loadConfigs } = useMasterDataContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRefresh = async () => {
    if (!brand || !environment) return
    
    setLoading(true)
    setError(null)
    
    try {
      await loadConfigs(brand, environment)
    } catch (err) {
      setError('Failed to load configurations')
      console.error('Error loading configs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (brand && environment) {
      handleRefresh()
    }
  }, [brand, environment])

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const renderConfigSection = (configType, configData, title) => {
    if (!configData) return null

    return (
      <Card 
        key={configType} 
        title={title} 
        size="small" 
        style={{ marginBottom: 16 }}
        extra={
          <Tooltip title="Copy configuration as JSON">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyToClipboard(JSON.stringify(configData, null, 2))}
            />
          </Tooltip>
        }
      >
        {configType === 'ITEM_CONFIG' && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Brand Bucket: </Text>
              <Tooltip title={configData.brand?.bucket_name}>
                <Tag color="blue">{configData.brand?.bucket_name || 'Not set'}</Tag>
              </Tooltip>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Category Bucket: </Text>
              <Tooltip title={configData.category?.bucket_name}>
                <Tag color="green">{configData.category?.bucket_name || 'Not set'}</Tag>
              </Tooltip>
            </div>
            <div>
              <Text strong>Product Bucket: </Text>
              <Tooltip title={configData.product?.bucket_name}>
                <Tag color="orange">{configData.product?.bucket_name || 'Not set'}</Tag>
              </Tooltip>
            </div>
          </div>
        )}

        {configType === 'GCP_CONFIG' && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Project: </Text>
              <Tooltip title={configData.project}>
                <Tag color="purple">{configData.project || 'Not set'}</Tag>
              </Tooltip>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Cluster: </Text>
              <Tooltip title={configData.cluster}>
                <Tag color="cyan">{configData.cluster || 'Not set'}</Tag>
              </Tooltip>
            </div>
            <div>
              <Text strong>Region: </Text>
              <Tooltip title={configData.region}>
                <Tag color="magenta">{configData.region || 'Not set'}</Tag>
              </Tooltip>
            </div>
          </div>
        )}
      </Card>
    )
  }

  if (!brand || !environment) {
    return (
      <Card>
        <Alert
          message="No Brand/Environment Selected"
          description="Please select a brand and environment to view configurations."
          type="info"
          showIcon
        />
      </Card>
    )
  }

  const isConfigComplete = configHelpers.isConfigComplete(configs)
  const hasConfigs = Object.keys(configs).length > 0

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Configuration for {brand} - {environment}
          </Title>
          <Space>
            {isConfigComplete ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Complete
              </Tag>
            ) : (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                Incomplete
              </Tag>
            )}
          </Space>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh} 
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Loading configurations...</Text>
          </div>
        </div>
      )}

      {!loading && !hasConfigs && !error && (
        <Alert
          message="No Configurations Found"
          description={`No configurations found for ${brand} - ${environment}. You may need to add them first.`}
          type="warning"
          showIcon
        />
      )}

      {!loading && hasConfigs && (
        <div>
          {renderConfigSection('ITEM_CONFIG', configs.ITEM_CONFIG, 'Item Configuration')}
          {renderConfigSection('GCP_CONFIG', configs.GCP_CONFIG, 'GCP Configuration')}
        </div>
      )}
    </div>
  )
}

export default ConfigViewer
