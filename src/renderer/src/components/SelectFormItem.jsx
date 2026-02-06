import { Form, Select } from 'antd'

const getTransformedItems = ({ transform, options }) => {
  switch (transform) {
    case 'COMPANIES':
      return options.map((option) => ({
        label: `${option.company_code} - ${option.company_name}`,
        value: option.company_code,
        key: option.company_code
      }))
    case 'GITHUHB_USERS':
      return options.map((option) => ({
        label: `${option.name} - @${option.github_handle} `,
        value: option.github_handle,
        key: option.github_handle
      }))
    case 'ENVIRONMENTS':
      return options.map((option) => ({
        label: option.env_code,
        value: option.env_code,
        key: option.env_code
      }))
    default:
      return options
  }
}

const SelectFormItem = ({
  options,
  name,
  label,
  placeholder,
  disabled = false,
  loading = false,
  allowClear = false,
  transform = null
}) => {
  const items = getTransformedItems({ transform, options })
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ required: true, message: `Please select ${label}` }]}
    >
      <Select
        disabled={disabled}
        loading={loading}
        allowClear={allowClear}
        showSearch
        style={{ minWidth: '200px' }}
        filterOption={(input, option) => {
          const labelStr = String(option?.label ?? '').toLowerCase()
          const valueStr = String(option?.value ?? '').toLowerCase()
          const search = input.toLowerCase()
          return labelStr.includes(search) || valueStr.includes(search)
        }}
        placeholder={placeholder || `Select ${label}`}
        options={items}
      />
    </Form.Item>
  )
}

export default SelectFormItem
