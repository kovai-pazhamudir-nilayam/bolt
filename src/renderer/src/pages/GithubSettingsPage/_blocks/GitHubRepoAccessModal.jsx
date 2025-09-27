/* eslint-disable react/prop-types */
import { Button, Form, Modal } from 'antd'
import InputFormItem from '../../../components/InputFormItem'
import SelectFormItem from '../../../components/SelectFormItem'

const GITHUB_PEMISSIONS = [
  {
    label: 'WRITE',
    value: 'push'
  },
  {
    label: 'READ',
    value: 'pull'
  },
  {
    label: 'ADMIN',
    value: 'admin'
  }
]

const GitHubRepoAccessModal = ({ values, onCancel, datasource, onFinish }) => {
  const { repo_name } = values
  const [form] = Form.useForm()
  return (
    <Modal
      title={`Github Access - ${repo_name} Repo`}
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
        <SelectFormItem
          transform={'GITHUHB_USERS'}
          options={datasource.users}
          name="github_handle"
          label="Github User"
        />
        <SelectFormItem options={GITHUB_PEMISSIONS} name="access_level" label="Github Permission" />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default GitHubRepoAccessModal
