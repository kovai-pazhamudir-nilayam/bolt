import { Form, Input, Typography } from 'antd'
import { useEffect } from 'react'

const { Text } = Typography

const LoopConfig = ({ config, onChange }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue(config)
  }, [config, form])

  const handleChange = (_, allValues) => onChange(allValues)

  return (
    <Form form={form} layout="vertical" onValuesChange={handleChange} size="small">
      <Form.Item
        label="Iterate Over"
        name="iterateOver"
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            Field name on the input object containing the array to loop over.
            Use <code>items</code> to iterate over all input rows.
          </Text>
        }
      >
        <Input placeholder="items" />
      </Form.Item>
      <div style={{ marginTop: 8, padding: '8px 10px', background: '#f9f0ff', borderRadius: 6, fontSize: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#531dab' }}>Handle legend</div>
        <div style={{ color: '#555' }}>↓ <strong>bottom</strong> — after all iterations complete</div>
        <div style={{ color: '#555' }}>→ <strong>right</strong> — for each individual item</div>
      </div>
    </Form>
  )
}

export default LoopConfig
