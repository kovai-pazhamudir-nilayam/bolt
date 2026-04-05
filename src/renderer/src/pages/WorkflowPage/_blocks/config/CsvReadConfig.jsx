import { Button, Form, Input, Table, Typography, Upload } from 'antd'
import { UploadCloud } from 'lucide-react'
import { useEffect, useState } from 'react'

const { Text } = Typography

function parsePreview(content, delimiter = ',') {
  if (!content) return { headers: [], rows: [] }
  const lines = content.trim().split('\n').filter(Boolean).slice(0, 4)
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1, 4).map((line, i) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''))
    const row = { _key: i }
    headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
    return row
  })
  return { headers, rows }
}

const CsvReadConfig = ({ config, onChange }) => {
  const [form] = Form.useForm()
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    form.setFieldsValue({ filePath: config.filePath, delimiter: config.delimiter })
    if (config.fileContent) {
      setPreview(parsePreview(config.fileContent, config.delimiter || ','))
    }
  }, [config, form])

  const handleChange = (_, allValues) => {
    onChange({ ...config, ...allValues })
    if (config.fileContent) {
      setPreview(parsePreview(config.fileContent, allValues.delimiter || ','))
    }
  }

  const handleFilePick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.tsv,.txt'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target.result
        const newConfig = { ...config, filePath: file.name, fileContent: content }
        onChange(newConfig)
        form.setFieldsValue({ filePath: file.name })
        setPreview(parsePreview(content, config.delimiter || ','))
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const previewColumns = preview?.headers.map((h) => ({
    title: h, dataIndex: h, key: h,
    render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</span>
  })) || []

  return (
    <Form form={form} layout="vertical" onValuesChange={handleChange} size="small">
      <Form.Item label="CSV File" name="filePath">
        <Input
          placeholder="Click Browse or enter file path"
          addonAfter={
            <Button size="small" type="link" onClick={handleFilePick} style={{ padding: 0 }}>
              Browse
            </Button>
          }
        />
      </Form.Item>
      <Form.Item label="Delimiter" name="delimiter">
        <Input placeholder="," style={{ width: 80 }} />
      </Form.Item>

      {preview && preview.rows.length > 0 && (
        <div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
            Preview (first 3 rows):
          </Text>
          <Table
            dataSource={preview.rows}
            columns={previewColumns}
            rowKey="_key"
            size="small"
            pagination={false}
            scroll={{ x: true }}
            style={{ fontSize: 11 }}
          />
        </div>
      )}

      {config.fileContent && (
        <Text type="secondary" style={{ fontSize: 11 }}>
          File loaded in memory ({(config.fileContent.length / 1024).toFixed(1)} KB)
        </Text>
      )}
    </Form>
  )
}

export default CsvReadConfig
