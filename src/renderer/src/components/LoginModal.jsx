import { Modal, Form, Input, Button } from 'antd'
import { Lock, User } from 'lucide-react'
import { useAuth } from '../context/authContext'

const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth()
  const [form] = Form.useForm()

  const handleLogin = async (values) => {
    try {
      await login(values.username, values.password)
      onClose()
      form.resetFields()
    } catch (error) {
      console.error(error)
      form.setFields([
        {
          name: 'password',
          errors: ['Invalid username or password']
        }
      ])
    }
  }

  return (
    <Modal title="Admin Login" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <Form
        form={form}
        name="login_form"
        layout="vertical"
        onFinish={handleLogin}
        autoComplete="off"
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input prefix={<User size={16} />} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<Lock size={16} />} placeholder="Password" />
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
