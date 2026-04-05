import { Button, Collapse, Form, Input, Select, Tooltip, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { parseCurl } from '../../engine/curlParser'

const { Text } = Typography
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const ApiCallConfig = ({ config, onChange }) => {
  const [form] = Form.useForm()
  const [curlInput, setCurlInput] = useState('')

  useEffect(() => {
    form.setFieldsValue(config)
  }, [config, form])

  const handleChange = (_, allValues) => onChange({ ...config, ...allValues })

  const handleCurlImport = () => {
    if (!curlInput.trim()) return
    const parsed = parseCurl(curlInput.trim())
    const merged = { ...config, ...parsed }
    onChange(merged)
    form.setFieldsValue(merged)
    setCurlInput('')
  }

  return (
    <Form form={form} layout="vertical" onValuesChange={handleChange} size="small">
      {/* cURL importer */}
      <Collapse
        size="small"
        ghost
        style={{ marginBottom: 8 }}
        items={[{
          key: '1',
          label: <Text style={{ fontSize: 12, color: '#888' }}>Import from cURL</Text>,
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Input.TextArea
                rows={3}
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                placeholder={`curl -X POST https://api.example.com/data \\\n  -H "Authorization: Bearer token" \\\n  -d '{"key":"value"}'`}
                style={{ fontFamily: 'monospace', fontSize: 11 }}
              />
              <Button size="small" onClick={handleCurlImport} type="primary" ghost>
                Parse & Fill
              </Button>
            </div>
          )
        }]}
      />

      <Form.Item label="Method" name="method">
        <Select options={METHODS.map((m) => ({ value: m, label: m }))} />
      </Form.Item>

      <Form.Item
        label={
          <span>
            URL{' '}
            <Tooltip title="Supports {{template}} variables resolved from upstream data. E.g. https://api.example.com/users/{{id}}">
              <Text type="secondary" style={{ fontSize: 11, cursor: 'help' }}>supports {'{{vars}}'}</Text>
            </Tooltip>
          </span>
        }
        name="url"
      >
        <Input placeholder="https://api.example.com/users/{{id}}" />
      </Form.Item>

      <Form.Item label="Headers (JSON)" name="headers">
        <Input.TextArea
          rows={3}
          placeholder={'{\n  "Authorization": "Bearer {{token}}"\n}'}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
      </Form.Item>

      <Form.Item label="Body" name="body">
        <Input.TextArea
          rows={4}
          placeholder='{"userId": "{{id}}"}'
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
      </Form.Item>

      <Form.Item label="Retry on error" name="retryCount">
        <Select
          options={[
            { value: 0, label: 'No retry' },
            { value: 1, label: '1 retry' },
            { value: 2, label: '2 retries' },
            { value: 3, label: '3 retries' }
          ]}
        />
      </Form.Item>
    </Form>
  )
}

export default ApiCallConfig
