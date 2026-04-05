import { Form, Input } from 'antd'
import { useEffect } from 'react'

const CsvWriteConfig = ({ config, onChange }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue(config)
  }, [config, form])

  const handleChange = (_, allValues) => onChange(allValues)

  return (
    <Form form={form} layout="vertical" onValuesChange={handleChange} size="small">
      <Form.Item label="Output File Path" name="filePath">
        <Input placeholder="/output/result.csv" />
      </Form.Item>
      <Form.Item label="Delimiter" name="delimiter">
        <Input placeholder="," style={{ width: 80 }} />
      </Form.Item>
    </Form>
  )
}

export default CsvWriteConfig
