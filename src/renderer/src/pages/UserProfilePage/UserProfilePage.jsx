import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, Row } from 'antd'
import { useEffect, useState } from 'react'
import CompanySelection from '../../components/CompanySelection'
import EnvironmentSelection from '../../components/EnvironmentSelection'
import PageHeader from '../../components/PageHeader/PageHeader'
import { userProfileFactory } from '../../repos/UserProfilePage.repo'
import SubmitBtnForm from '../../components/SubmitBtnForm'
import withNotification from '../../hoc/withNotification'

const { userProfileRepo } = userProfileFactory()

const UserProfilePageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [userProfile] = await userProfileRepo.getAll()

      const data = {
        ...userProfile,
        user_ids: JSON.parse(userProfile.user_ids)
      }
      form.setFieldsValue(data)
    } catch {
      renderErrorNotification({ message: 'Failed to load user profile' })
    }
  }

  const onFinish = async (values) => {
    try {
      setLoading(true)
      await userProfileRepo.upsert(values)
      renderSuccessNotification({ message: 'User profile saved successfully!' })
    } catch (error) {
      renderErrorNotification({ message: 'Failed to save user profile' })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="User Profile"
        description="Manage user profile information and company/environment specific user IDs."
      />

      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
        disabled={loading}
      >
        <Form.Item
          name="phone_number"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please enter phone number' },
            {
              pattern: /^[0-9]{10,15}$/,
              message: 'Please enter a valid phone number (10-15 digits)'
            }
          ]}
        >
          <Input placeholder="Enter phone number" maxLength={15} />
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

        <Form.List name="user_ids">
          {(fields, { add, remove }) => (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16
                }}
              >
                <strong>User IDs (Company & Environment)</strong>
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Add User ID
                </Button>
              </div>

              {fields.map(({ key, name }) => (
                <div
                  key={key}
                  style={{
                    marginBottom: 16,
                    padding: '16px 16px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col>
                      <CompanySelection name={[name, 'company_code']} />
                    </Col>
                    <Col>
                      <EnvironmentSelection name={[name, 'env_code']} />
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={[name, 'user_id']}
                        label="User ID (UUID)"
                        rules={[
                          { required: true, message: 'Please enter User ID' },
                          {
                            pattern:
                              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                            message:
                              'Please enter a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)'
                          }
                        ]}
                      >
                        <Input placeholder="Enter User ID (UUID)" disabled={loading} />
                      </Form.Item>
                    </Col>
                    <Col style={{ marginTop: 30 }}>
                      <Button
                        type="text"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        disabled={fields.length === 1}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}

              {fields.length === 0 && (
                <Button
                  style={{
                    marginBottom: 16
                  }}
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add User ID
                </Button>
              )}
            </>
          )}
        </Form.List>

        <SubmitBtnForm btnText="Update Profile" />
      </Form>
    </div>
  )
}

const UserProfilePage = withNotification(UserProfilePageWOC)

export default UserProfilePage
