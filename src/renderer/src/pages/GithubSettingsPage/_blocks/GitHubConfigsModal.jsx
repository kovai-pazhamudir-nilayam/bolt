import { Button, Form, Input, Modal, Select } from 'antd'
const { Option } = Select

const GitHubConfigsModal = ({ editingItem, handleCancel, handleSave, companies }) => {
  const [form] = Form.useForm()
  return (
    <Modal
      title={editingItem ? 'Edit GitHub Config' : 'Add New GitHub Config'}
      open={true}
      footer={null}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
    >
      <Form
        initialValues={{
          company_code: 'KPN',
          github_token: 'sdfg',
          owner: 'owner'
        }}
        onFinish={handleSave}
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="company_code"
          label="Company"
          rules={[{ required: true, message: 'Please select company' }]}
        >
          <Select placeholder="Select company">
            {companies.map((company) => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="github_token"
          label="GitHub Token"
          rules={[{ required: true, message: 'Please enter GitHub token' }]}
        >
          <Input.Password placeholder="ghp_xxxxxxxxxxxx" />
        </Form.Item>
        <Form.Item
          name="owner"
          label="Owner"
          rules={[{ required: true, message: 'Please enter GitHub owner' }]}
        >
          <Input placeholder="organization or username" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default GitHubConfigsModal
