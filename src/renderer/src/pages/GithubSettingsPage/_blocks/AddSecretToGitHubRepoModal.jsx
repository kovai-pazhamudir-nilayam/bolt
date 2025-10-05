
import { Button, Checkbox, Form, Modal } from 'antd'
import InputFormItem from '../../../components/InputFormItem'
import SelectFormItem from '../../../components/SelectFormItem'

const getGroupedSecret = (data) => {
  return data.reduce((acc, item) => {
    const key = item.company_code
    // create array for this company_code if it doesn't exist
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

const AddSecretToGitHubRepoModal = ({ values, onCancel, datasource, onFinish }) => {
  const { repo_name, company_code } = values

  const secrets = getGroupedSecret(datasource.secrets)[company_code]

  const [form] = Form.useForm()
  return (
    <Modal
      title={`Add Secret to Github - ${repo_name} Repo`}
      open={true}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
      footer={null}
    >
      <Form
        initialValues={values}
        onFinish={onFinish}
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <SelectFormItem
          transform={'COMPANIES'}
          options={datasource.companies}
          name="company_code"
          label="Company"
          disabled={true}
        />
        <InputFormItem disabled={true} name="repo_name" label="Repository Name" />
        <Form.Item
          name="secrets"
          label="Select Secrets"
          rules={[{ required: true, message: 'Please choose at least one secret' }]}
        >
          <Checkbox.Group
            options={secrets.map((secret) => ({
              label: secret.secret_name,
              value: { secret_name: secret.secret_name, secret_value: secret.secret_value }
            }))}
          />
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

export default AddSecretToGitHubRepoModal
