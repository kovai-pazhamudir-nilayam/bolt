import { Card, Descriptions, Tag, message, Button, Input } from 'antd'
import { useEffect, useState } from 'react'
import { userProfileFactory } from '../../../repos/UserProfilePage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'

const { userProfileRepo } = userProfileFactory()
const { companyRepo, environmentRepo } = settingsFactory()

const UserIdTab = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [companies, setCompanies] = useState([])
  const [environments, setEnvironments] = useState([])
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

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
    } catch (error) {
      message.error('Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (phone) => {
    try {
      setLoading(true)
      const profile = await userProfileRepo.getByPhone(phone)
      if (profile) {
        setUserProfile(profile)
      } else {
        setUserProfile(null)
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

  const getCompanyName = (companyCode) => {
    const company = companies.find((c) => c.company_code === companyCode)
    return company ? company.company_name : companyCode
  }

  const getEnvironmentName = (envCode) => {
    const env = environments.find((e) => e.env_code === envCode)
    return env ? env.env_name : envCode
  }

  const generateUserId = (profile) => {
    if (!profile) return ''
    return `${profile.company_code}-${profile.env_code}-${profile.phone_number}`
  }

  return (
    <div>
      <Card title="User ID Information" style={{ margin: '20px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Enter phone number to search user profile"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onSearch={handleSearch}
            enterButton="Search"
            loading={loading}
            style={{ maxWidth: 400 }}
          />
        </div>

        {userProfile && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="User ID">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {generateUserId(userProfile)}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Phone Number">
              <Tag color="green">{userProfile.phone_number}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Full Name">{userProfile.name}</Descriptions.Item>

            <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>

            <Descriptions.Item label="Company">
              <Tag color="purple">{getCompanyName(userProfile.company_code)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Environment">
              <Tag color="orange">{getEnvironmentName(userProfile.env_code)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Company + Environment ID">
              <Tag color="cyan">
                {userProfile.company_code}-{userProfile.env_code}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {new Date(userProfile.created_at).toLocaleString()}
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              {new Date(userProfile.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}

        {!userProfile && phoneNumber && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No user profile found for phone number: {phoneNumber}
          </div>
        )}

        {!phoneNumber && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            Enter a phone number to view user ID information
          </div>
        )}
      </Card>
    </div>
  )
}

export default UserIdTab
