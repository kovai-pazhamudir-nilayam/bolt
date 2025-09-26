import { Form, Input } from 'antd'

const InputFormItem = ({ name, label, isTextArea = false }) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ required: true, message: `Please enter ${label}` }]}
    >
      {isTextArea ? (
        <Input.TextArea placeholder={`Enter ${label}`} rows={4} />
      ) : (
        <Input placeholder={`Enter ${label}`} />
      )}
    </Form.Item>
  )
}

export default InputFormItem
