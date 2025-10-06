import { Button, Form, Input, Card, message } from 'antd'
import { useEffect, useState } from 'react'
import { userProfileFactory } from '../../../repos/UserProfilePage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'

const { userProfileRepo } = userProfileFactory()
const { companyRepo, environmentRepo } = settingsFactory()

const PersonalInfoTab = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [environments, setEnvironments] = useState([])
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [companiesData, environmentsData] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])
      setCompanies(companiesData)
      setEnvironments(environmentsData)
    } catch {
      message.error('Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (phoneNumber) => {
    try {
      const profile = await userProfileRepo.getByPhone(phoneNumber)
      if (profile) {
        setUserProfile(profile)
        form.setFieldsValue({
          ...profile,
          features: profile.features || {}
        })
      }
    } catch {
      message.error('Failed to load user profile')
    }
  }

  const onFinish = async (values) => {
    try {
      setLoading(true)
      await userProfileRepo.upsert(values)
      message.success('User profile saved successfully!')
      loadUserProfile(values.phone_number)
    } catch {
      message.error('Failed to save user profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneNumberChange = (e) => {
    const phoneNumber = e.target.value
    if (phoneNumber && phoneNumber.length >= 10) {
      loadUserProfile(phoneNumber)
    } else {
      setUserProfile(null)
      form.resetFields(['name', 'email', 'password', 'company_code', 'env_code'])
    }
  }

  return (
    <Card title="Personal Information" style={{ margin: '20px 0' }}>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
        disabled={loading}
      >
        <Form.Item
          name="phone_number"
          label="Mobile Number"
          rules={[
            { required: true, message: 'Please enter mobile number' },
            {
              pattern: /^[0-9]{10,15}$/,
              message: 'Please enter a valid mobile number (10-15 digits)'
            }
          ]}
        >
          <Input
            placeholder="Enter mobile number"
            onChange={handlePhoneNumberChange}
            maxLength={15}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input placeholder="Enter email address" type="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item
          name="company_code"
          label="Company"
          rules={[{ required: true, message: 'Please select company' }]}
        >
          <Input placeholder="Enter company code" list="companies" disabled={!!userProfile} />
          <datalist id="companies">
            {companies.map((company) => (
              <option key={company.company_code} value={company.company_code}>
                {company.company_name}
              </option>
            ))}
          </datalist>
        </Form.Item>

        <Form.Item
          name="env_code"
          label="Environment"
          rules={[{ required: true, message: 'Please select environment' }]}
        >
          <Input
            placeholder="Enter environment code"
            list="environments"
            disabled={!!userProfile}
          />
          <datalist id="environments">
            {environments.map((env) => (
              <option key={env.env_code} value={env.env_code}>
                {env.env_name}
              </option>
            ))}
          </datalist>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {userProfile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default PersonalInfoTab
