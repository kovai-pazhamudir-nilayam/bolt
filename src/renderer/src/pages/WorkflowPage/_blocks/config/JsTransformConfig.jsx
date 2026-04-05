import { Form, Typography } from 'antd'
import { useEffect } from 'react'

const { Text } = Typography

const JsTransformConfig = ({ config, onChange }) => {
  const handleCodeChange = (e) => {
    onChange({ ...config, code: e.target.value })
  }

  return (
    <Form layout="vertical" size="small">
      <Form.Item
        label="Transform Code"
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            Function receives <code>items</code> (array). Must return an array.
          </Text>
        }
      >
        <textarea
          value={config?.code || ''}
          onChange={handleCodeChange}
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: 160,
            fontFamily: 'monospace',
            fontSize: 12,
            padding: '8px 10px',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            resize: 'vertical',
            outline: 'none',
            background: '#1e1e2e',
            color: '#cdd6f4',
            lineHeight: 1.6
          }}
          placeholder={`return items.map(item => ({
  ...item,
  fullName: item.first + ' ' + item.last
}))`}
        />
      </Form.Item>
    </Form>
  )
}

export default JsTransformConfig
