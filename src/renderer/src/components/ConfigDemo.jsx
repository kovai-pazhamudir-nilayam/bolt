import React from 'react'
import { Card, Button, Space, Typography, Tag, Alert } from 'antd'
import { useMasterDataContext } from '../context/masterDataContext'
import { configHelpers } from '../helpers/configManager.helper'

const { Title, Text, Paragraph } = Typography

/**
 * Demo component showing how to use the configuration system
 * This can be integrated into any part of your app
 */
const ConfigDemo = () => {
  const { brand, environment, configs } = useMasterDataContext()

  // Example: Get specific configuration values
  const brandBucket = configHelpers.getBucketName(configs, 'brand')
  const gcpConfig = configHelpers.getGCPConfig(configs)
  const isConfigComplete = configHelpers.isConfigComplete(configs)

  const handleUseConfigs = () => {
    if (!isConfigComplete) {
      alert('Configuration is incomplete. Please complete the configuration in Settings.')
      return
    }

    // Example usage in your app logic
    console.log('Using configurations:', {
      brandBucket,
      gcpConfig,
      allConfigs: configs
    })

    alert(`Using brand bucket: ${brandBucket}\nGCP Project: ${gcpConfig?.project}`)
  }

  return (
    <Card title="Configuration Usage Demo" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Current Selection</Title>
          <Space>
            <Tag color="blue">Brand: {brand || 'Not selected'}</Tag>
            <Tag color="green">Environment: {environment || 'Not selected'}</Tag>
          </Space>
        </div>

        <div>
          <Title level={4}>Configuration Status</Title>
          {isConfigComplete ? (
            <Alert
              message="Configuration Complete"
              description="All required configurations are available"
              type="success"
              showIcon
            />
          ) : (
            <Alert
              message="Configuration Incomplete"
              description="Some configurations are missing. Please complete them in Settings."
              type="warning"
              showIcon
            />
          )}
        </div>

        <div>
          <Title level={4}>Configuration Values</Title>
          <Paragraph>
            <Text strong>Brand Bucket: </Text>
            <Text code>{brandBucket || 'Not configured'}</Text>
          </Paragraph>
          <Paragraph>
            <Text strong>GCP Project: </Text>
            <Text code>{gcpConfig?.project || 'Not configured'}</Text>
          </Paragraph>
          <Paragraph>
            <Text strong>GCP Cluster: </Text>
            <Text code>{gcpConfig?.cluster || 'Not configured'}</Text>
          </Paragraph>
          <Paragraph>
            <Text strong>GCP Region: </Text>
            <Text code>{gcpConfig?.region || 'Not configured'}</Text>
          </Paragraph>
        </div>

        <div>
          <Title level={4}>Example Usage</Title>
          <Button 
            type="primary" 
            onClick={handleUseConfigs}
            disabled={!brand || !environment}
          >
            Use Configurations in App Logic
          </Button>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            This button demonstrates how to use configurations in your app
          </Text>
        </div>

        <div>
          <Title level={4}>Integration Example</Title>
          <Paragraph>
            <Text code>
{`// In any component:
import { useMasterDataContext } from '../context/masterDataContext'
import { configHelpers } from '../helpers/configManager.helper'

const MyComponent = () => {
  const { configs } = useMasterDataContext()
  
  const bucketName = configHelpers.getBucketName(configs, 'brand')
  const gcpConfig = configHelpers.getGCPConfig(configs)
  
  // Use the configurations...
}`}
            </Text>
          </Paragraph>
        </div>
      </Space>
    </Card>
  )
}

export default ConfigDemo
