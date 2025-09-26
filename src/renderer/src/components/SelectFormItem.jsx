import { Form, Select } from 'antd'
const { Option } = Select

const SelectFormItem = ({ items, name, label }) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ required: true, message: `Please select ${label}` }]}
    >
      <Select
        showSearch
        filterOption={(input, option) =>
          (option?.key ?? '').toLowerCase().includes(input.toLowerCase()) ||
          (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
        }
        placeholder="Select company"
      >
        {items.map((company) => (
          <Option key={company.company_code} value={company.company_code}>
            {company.company_code}
          </Option>
        ))}
      </Select>
    </Form.Item>
  )
}

export default SelectFormItem
