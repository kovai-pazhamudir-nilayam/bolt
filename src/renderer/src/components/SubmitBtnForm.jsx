/* eslint-disable react/prop-types */
import { Button, Form } from 'antd'

const SubmitBtnForm = ({ loading = false }) => {
  return (
    <Form.Item>
      <Button loading={loading} type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  )
}
export default SubmitBtnForm
