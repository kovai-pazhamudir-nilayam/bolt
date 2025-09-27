/* eslint-disable react/prop-types */
import { Form, Modal } from 'antd'
import InputFormItem from '../../../components/InputFormItem'
import SelectFormItem from '../../../components/SelectFormItem'
import SubmitBtnForm from '../../../components/SubmitBtnForm'

const AddNewGithubRepoModal = ({ handleCancel, datasource, onFinish }) => {
  return (
    <Modal
      title={'Add New Repository'}
      open={true}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
      footer={null}
    >
      <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
        <SelectFormItem
          transform={'COMPANIES'}
          options={datasource.companies}
          name="company_code"
          label="Company"
        />
        <InputFormItem name="repo_name" label="Repository Name" />
        <SubmitBtnForm />
      </Form>
    </Modal>
  )
}
export default AddNewGithubRepoModal
