import { Form, Input } from 'antd'

const InputFormItem = ({ name, label, isTextArea = false, disabled = false }) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ required: true, message: `Please enter ${label}` }]}
    >
      {isTextArea ? (
        <Input.TextArea disabled={disabled} placeholder={`Enter ${label}`} rows={4} />
      ) : (
        <Input disabled={disabled} placeholder={`Enter ${label}`} />
      )}
    </Form.Item>
  )
}

export default InputFormItem
