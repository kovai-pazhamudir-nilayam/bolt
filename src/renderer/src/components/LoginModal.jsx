import { Modal, Form, Input, Button } from 'antd'
import { Lock, Phone } from 'lucide-react'
import { useAuth } from '../context/authContext'

const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth()
  const [form] = Form.useForm()

  const handleLogin = async (values) => {
    try {
      await login(values.phone, values.password)
      onClose()
      form.resetFields()
    } catch (error) {
      console.error(error)
      form.setFields([
        {
          name: 'password',
          errors: ['Invalid Phone or Password']
        }
      ])
    }
  }

  return (
    <Modal title="Login" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <Form
        form={form}
        name="login_form"
        layout="vertical"
        onFinish={handleLogin}
        autoComplete="off"
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: 'Please input your phone number!' },
            { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number' }
          ]}
        >
          <Input
            prefix={<Phone size={16} />}
            placeholder="Phone Number (e.g. 9999999999)"
            maxLength={10}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<Lock size={16} />} placeholder="Password (e.g. admin)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default LoginModal
