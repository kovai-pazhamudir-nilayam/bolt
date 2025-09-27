/* eslint-disable react/prop-types */

import { Form, Modal } from 'antd'
import InputFormItem from '../../../components/InputFormItem'
import SubmitBtnForm from '../../../components/SubmitBtnForm'
import _ from 'lodash'

const AddGitHubUserModal = ({ handleCancel, onFinish, values }) => {
  return (
    <Modal
      title={_.isEmpty(values) ? 'Add New GitHub User' : 'Edit GitHub User'}
      open={true}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
      footer={null}
    >
      <Form initialValues={values} onFinish={onFinish} layout="vertical" requiredMark={false}>
        <InputFormItem name="name" label="Name" />
        <InputFormItem name="github_handle" label="GitHub Handle" />
        <SubmitBtnForm />
      </Form>
    </Modal>
  )
}

export default AddGitHubUserModal
