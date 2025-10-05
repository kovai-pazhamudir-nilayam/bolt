/* eslint-disable react/prop-types */
import { Button, Form } from 'antd'

const SubmitBtnForm = ({ loading = false, btnText = 'Submit' }) => {
  return (
    <Form.Item>
      <Button loading={loading} type="primary" htmlType="submit">
        {btnText}
      </Button>
    </Form.Item>
  )
}
export default SubmitBtnForm
