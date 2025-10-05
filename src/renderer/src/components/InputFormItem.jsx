import { Form, Input } from 'antd'

const InputFormItem = ({
  name,
  label,
  isTextArea = false,
  disabled = false,
  isOptional = false,
  placeholder = `Enter ${label}`
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ required: !isOptional, message: `Please enter ${label}` }]}
    >
      {isTextArea ? (
        <Input.TextArea disabled={disabled} placeholder={placeholder} rows={4} />
      ) : (
        <Input disabled={disabled} placeholder={placeholder} />
      )}
    </Form.Item>
  )
}

export default InputFormItem
