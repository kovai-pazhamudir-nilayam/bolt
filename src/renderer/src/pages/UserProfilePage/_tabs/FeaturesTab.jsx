import { Card, Form, Select, Button, message, Input, Table, Tag, Space } from 'antd'
import { useEffect, useState } from 'react'
import { userProfileFactory } from '../../../repos/UserProfilePage.repo'

const { userProfileRepo } = userProfileFactory()

const { Option } = Select

const FeaturesTab = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [features, setFeatures] = useState({})

  // Predefined features that can be configured
  const availableFeatures = [
    { key: 'dashboard', name: 'Dashboard Access', description: 'Access to main dashboard' },
    { key: 'settings', name: 'Settings Management', description: 'Manage application settings' },
    { key: 'user_management', name: 'User Management', description: 'Manage user accounts' },
    { key: 'reports', name: 'Reports', description: 'Generate and view reports' },
    { key: 'analytics', name: 'Analytics', description: 'View analytics and insights' },
    { key: 'api_access', name: 'API Access', description: 'Access to API endpoints' },
    { key: 'admin_panel', name: 'Admin Panel', description: 'Access to admin panel' },
    { key: 'data_export', name: 'Data Export', description: 'Export data functionality' },
    { key: 'notifications', name: 'Notifications', description: 'Manage notifications' },
    { key: 'audit_logs', name: 'Audit Logs', description: 'View audit logs' }
  ]

  const permissionOptions = [
    { value: 'READ', label: 'Read Only', color: 'blue' },
    { value: 'WRITE', label: 'Read & Write', color: 'green' },
    { value: 'HIDDEN', label: 'Hidden', color: 'red' }
  ]

  const loadUserProfile = async (phone) => {
    try {
      setLoading(true)
      const profile = await userProfileRepo.getByPhone(phone)
      if (profile) {
        setUserProfile(profile)
        const userFeatures = profile.features || {}
        setFeatures(userFeatures)
        form.setFieldsValue({ features: userFeatures })
      } else {
        setUserProfile(null)
        setFeatures({})
        message.warning('No user profile found for this phone number')
      }
    } catch (error) {
      message.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (phoneNumber && phoneNumber.length >= 10) {
      loadUserProfile(phoneNumber)
    } else {
      message.warning('Please enter a valid phone number')
    }
  }

  const onFinish = async (values) => {
    try {
      setLoading(true)
      await userProfileRepo.updateFeatures({
        phone_number: phoneNumber,
        features: values.features
      })
      setFeatures(values.features)
      message.success('Features updated successfully!')
    } catch (error) {
      message.error('Failed to update features')
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureChange = (featureKey, permission) => {
    const newFeatures = { ...features, [featureKey]: permission }
    setFeatures(newFeatures)
    form.setFieldsValue({ features: newFeatures })
  }

  const getPermissionColor = (permission) => {
    const option = permissionOptions.find(opt => opt.value === permission)
    return option ? option.color : 'default'
  }

  const getPermissionLabel = (permission) => {
    const option = permissionOptions.find(opt => opt.value === permission)
    return option ? option.label : permission
  }

  const columns = [
    {
      title: 'Feature',
      dataIndex: 'name',
      key: 'name',
      width: '25%'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '35%'
    },
    {
      title: 'Current Permission',
      key: 'currentPermission',
      width: '20%',
      render: (_, record) => {
        const currentPermission = features[record.key] || 'HIDDEN'
        return (
          <Tag color={getPermissionColor(currentPermission)}>
            {getPermissionLabel(currentPermission)}
          </Tag>
        )
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        <Select
          value={features[record.key] || 'HIDDEN'}
          onChange={(value) => handleFeatureChange(record.key, value)}
          style={{ width: '100%' }}
          size="small"
        >
          {permissionOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      )
    }
  ]

  return (
    <div>
      <Card title="Feature Permissions" style={{ margin: '20px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Enter phone number to manage features"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onSearch={handleSearch}
            enterButton="Search"
            loading={loading}
            style={{ maxWidth: 400 }}
          />
        </div>

        {userProfile && (
          <div>
            <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
              <strong>User:</strong> {userProfile.name} ({userProfile.phone_number}) | 
              <strong> Company:</strong> {userProfile.company_code} | 
              <strong> Environment:</strong> {userProfile.env_code}
            </div>

            <Form form={form} onFinish={onFinish} layout="vertical">
              <Table
                dataSource={availableFeatures}
                columns={columns}
                rowKey="key"
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
              />

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Feature Permissions
                  </Button>
                  <Button 
                    onClick={() => {
                      const hiddenFeatures = {}
                      availableFeatures.forEach(feature => {
                        hiddenFeatures[feature.key] = 'HIDDEN'
                      })
                      setFeatures(hiddenFeatures)
                      form.setFieldsValue({ features: hiddenFeatures })
                    }}
                  >
                    Set All Hidden
                  </Button>
                  <Button 
                    onClick={() => {
                      const readFeatures = {}
                      availableFeatures.forEach(feature => {
                        readFeatures[feature.key] = 'READ'
                      })
                      setFeatures(readFeatures)
                      form.setFieldsValue({ features: readFeatures })
                    }}
                  >
                    Set All Read
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {!userProfile && phoneNumber && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No user profile found for phone number: {phoneNumber}
          </div>
        )}

        {!phoneNumber && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            Enter a phone number to manage feature permissions
          </div>
        )}
      </Card>
    </div>
  )
}

export default FeaturesTab
