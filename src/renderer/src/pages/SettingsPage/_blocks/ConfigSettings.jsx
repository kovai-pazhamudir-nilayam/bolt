import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Typography
} from 'antd'
import React, { useState } from 'react'
import ConfigViewer from '../../../components/ConfigViewer'
import PageHeader from '../../../components/PageHeader/PageHeader'
import { useMasterDataContext } from '../../../context/masterDataContext'
import { ConfigManager } from '../../../helpers/configManager.helper'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const ConfigSettings = () => {
  const { brand, environment, configs, brands, environments, setMasterData, refreshBrands } =
    useMasterDataContext()

  const [form] = Form.useForm()
  const [editingConfig, setEditingConfig] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const configTypes = [
    {
      key: 'ITEM_CONFIG',
      label: 'Item Configuration',
      description: 'Bucket configurations for brand, category, and product items'
    },
    {
      key: 'GCP_CONFIG',
      label: 'GCP Configuration',
      description: 'Google Cloud Platform project, cluster, and region settings'
    }
  ]

  const handleBrandChange = async (value) => {
    await setMasterData({ brand: value, environment: null })
  }

  const handleEnvironmentChange = async (value) => {
    await setMasterData({ environment: value })
  }

  const handleEditConfig = (configType) => {
    const existingConfig = configs[configType] || ConfigManager.createConfigTemplate(configType)
    setEditingConfig({ type: configType, data: existingConfig })
    form.setFieldsValue({
      configType,
      configData: JSON.stringify(existingConfig, null, 2)
    })
    setIsModalVisible(true)
  }

  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields()
      const configData = JSON.parse(values.configData)

      // Validate the configuration
      const validation = ConfigManager.validateConfig(configData, values.configType)
      if (!validation.isValid) {
        message.error(`Validation failed: ${validation.errors.join(', ')}`)
        return
      }

      setLoading(true)
      const success = await ConfigManager.saveConfig(
        brand,
        environment,
        values.configType,
        configData
      )

      if (success) {
        message.success('Configuration saved successfully!')
        setIsModalVisible(false)
        // Refresh the configs
        await setMasterData({})
      } else {
        message.error('Failed to save configuration')
      }
    } catch (error) {
      if (error.message.includes('JSON')) {
        message.error('Invalid JSON format')
      } else {
        message.error('Failed to save configuration')
      }
      console.error('Error saving config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfig = async (configType) => {
    Modal.confirm({
      title: 'Delete Configuration',
      content: `Are you sure you want to delete the ${configType} configuration?`,
      onOk: async () => {
        try {
          // Note: You might want to add a delete method to ConfigManager
          // For now, we'll save an empty object to "delete" it
          await ConfigManager.saveConfig(brand, environment, configType, {})
          message.success('Configuration deleted successfully!')
          await setMasterData({})
        } catch (error) {
          message.error('Failed to delete configuration')
          console.error('Error deleting config:', error)
        }
      }
    })
  }

  const renderConfigEditor = () => {
    if (!editingConfig) return null

    const { type, data } = editingConfig

    return (
      <Form form={form} layout="vertical">
        <Form.Item name="configType" label="Configuration Type" rules={[{ required: true }]}>
          <Select disabled>
            <Option value={type}>{configTypes.find((c) => c.key === type)?.label}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="configData"
          label="Configuration Data (JSON)"
          rules={[
            { required: true, message: 'Please enter configuration data' },
            {
              validator: (_, value) => {
                try {
                  JSON.parse(value)
                  return Promise.resolve()
                } catch {
                  return Promise.reject(new Error('Invalid JSON format'))
                }
              }
            }
          ]}
        >
          <TextArea
            rows={12}
            placeholder="Enter configuration data in JSON format..."
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
      </Form>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={'Configuration Management'}
        description={'Manage brand and environment specific configurations for your application.'}
      />

      {/* Brand and Environment Selection */}
      <Card title="Brand & Environment Selection" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Brand">
              <Select
                value={brand}
                onChange={handleBrandChange}
                placeholder="Select a brand"
                style={{ width: '100%' }}
              >
                {brands.map((b) => (
                  <Option key={b} value={b}>
                    {b.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Environment">
              <Select
                value={environment}
                onChange={handleEnvironmentChange}
                placeholder="Select an environment"
                style={{ width: '100%' }}
                disabled={!brand}
              >
                {environments.map((env) => (
                  <Option key={env} value={env}>
                    {env}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Configuration Management */}
      {brand && environment && (
        <Row gutter={24}>
          <Col span={16}>
            <ConfigViewer />
          </Col>
          <Col span={8}>
            <Card title="Configuration Actions" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Available Configurations:</Text>

                {configTypes.map((configType) => {
                  const exists = configs[configType.key]
                  return (
                    <div
                      key={configType.key}
                      style={{
                        padding: 12,
                        border: '1px solid #d9d9d9',
                        borderRadius: 6,
                        backgroundColor: exists ? '#f6ffed' : '#fff2e8'
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>{configType.label}</Text>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {configType.description}
                        </div>
                      </div>

                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditConfig(configType.key)}
                        >
                          {exists ? 'Edit' : 'Create'}
                        </Button>

                        {exists && (
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteConfig(configType.key)}
                          >
                            Delete
                          </Button>
                        )}
                      </Space>
                    </div>
                  )
                })}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Configuration Editor Modal */}
      <Modal
        title={`${editingConfig ? 'Edit' : 'Create'} Configuration`}
        open={isModalVisible}
        onOk={handleSaveConfig}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        width={800}
        okText="Save Configuration"
        cancelText="Cancel"
      >
        {renderConfigEditor()}
      </Modal>
    </div>
  )
}

export default ConfigSettings
