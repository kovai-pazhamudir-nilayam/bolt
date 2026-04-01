import { Button, Card, Col, Input, Row, Space, Tabs } from 'antd'
import { Braces, Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import './JsonFormatterPage.less'

const { TextArea } = Input

const parseCSVLine = (line) => {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  values.push(current.trim())
  return values
}

const JsonFormatterPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [formatInput, setFormatInput] = useState('')
  const [formatOutput, setFormatOutput] = useState('')
  const [jsonToCsvInput, setJsonToCsvInput] = useState('')
  const [jsonToCsvOutput, setJsonToCsvOutput] = useState('')
  const [csvToJsonInput, setCsvToJsonInput] = useState('')
  const [csvToJsonOutput, setCsvToJsonOutput] = useState('')

  // --- Format tab ---

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(formatInput)
      setFormatOutput(JSON.stringify(parsed, null, 2))
    } catch {
      renderErrorNotification({ message: 'Invalid JSON input' })
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(formatInput)
      setFormatOutput(JSON.stringify(parsed))
    } catch {
      renderErrorNotification({ message: 'Invalid JSON input' })
    }
  }

  const handleFormatSwap = () => {
    setFormatInput(formatOutput)
    setFormatOutput(formatInput)
  }

  const handleFormatClear = () => {
    setFormatInput('')
    setFormatOutput('')
  }

  const handleFormatCopy = () => {
    if (!formatOutput) return
    navigator.clipboard.writeText(formatOutput)
    renderSuccessNotification({ message: 'Copied to clipboard.' })
  }

  // --- JSON to CSV tab ---

  const handleJsonToCsv = () => {
    try {
      const data = JSON.parse(jsonToCsvInput)
      if (!Array.isArray(data) || data.length === 0) {
        renderErrorNotification({ message: 'Input must be a non-empty JSON array of objects' })
        return
      }
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = row[h] === null || row[h] === undefined ? '' : String(row[h])
              return val.includes(',') || val.includes('\n') || val.includes('"')
                ? `"${val.replace(/"/g, '""')}"`
                : val
            })
            .join(',')
        )
      ]
      setJsonToCsvOutput(csvRows.join('\n'))
    } catch {
      renderErrorNotification({ message: 'Invalid JSON input' })
    }
  }

  const handleJsonToCsvClear = () => {
    setJsonToCsvInput('')
    setJsonToCsvOutput('')
  }

  const handleJsonToCsvCopy = () => {
    if (!jsonToCsvOutput) return
    navigator.clipboard.writeText(jsonToCsvOutput)
    renderSuccessNotification({ message: 'Copied to clipboard.' })
  }

  // --- CSV to JSON tab ---

  const handleCsvToJson = () => {
    try {
      const lines = csvToJsonInput.trim().split('\n')
      if (lines.length < 2) {
        renderErrorNotification({ message: 'CSV must have a header row and at least one data row' })
        return
      }
      const headers = parseCSVLine(lines[0])
      const result = lines.slice(1).map((line) => {
        const values = parseCSVLine(line)
        return headers.reduce((obj, h, i) => {
          obj[h] = values[i] ?? ''
          return obj
        }, {})
      })
      setCsvToJsonOutput(JSON.stringify(result, null, 2))
    } catch {
      renderErrorNotification({ message: 'Failed to parse CSV' })
    }
  }

  const handleCsvToJsonClear = () => {
    setCsvToJsonInput('')
    setCsvToJsonOutput('')
  }

  const handleCsvToJsonCopy = () => {
    if (!csvToJsonOutput) return
    navigator.clipboard.writeText(csvToJsonOutput)
    renderSuccessNotification({ message: 'Copied to clipboard.' })
  }

  const tabItems = [
    {
      key: 'format',
      label: 'Beautify / Minify',
      children: (
        <Row gutter={[16, 16]} align="stretch" className="jf_content_row">
          <Col span={11}>
            <Card className="jf_card" title="Input JSON">
              <TextArea
                value={formatInput}
                onChange={(e) => setFormatInput(e.target.value)}
                placeholder="Paste your JSON here..."
                className="jf_textarea"
              />
            </Card>
          </Col>

          <Col span={2} className="jf_middle_actions">
            <Space direction="vertical" align="center">
              <Button type="primary" block onClick={handleBeautify} disabled={!formatInput}>
                Beautify
              </Button>
              <Button type="primary" block onClick={handleMinify} disabled={!formatInput}>
                Minify
              </Button>
              <Button block onClick={handleFormatSwap} disabled={!formatOutput}>
                Swap
              </Button>
              <Button danger icon={<Trash2 size={14} />} block onClick={handleFormatClear}>
                Clear
              </Button>
            </Space>
          </Col>

          <Col span={11}>
            <Card
              className="jf_card"
              title="Output"
              extra={
                formatOutput && (
                  <Button size="small" icon={<Copy size={14} />} onClick={handleFormatCopy}>
                    Copy
                  </Button>
                )
              }
            >
              <TextArea
                value={formatOutput}
                readOnly
                placeholder="Result will appear here..."
                className="jf_textarea jf_output"
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'json-to-csv',
      label: 'JSON → CSV',
      children: (
        <Row gutter={[16, 16]} align="stretch" className="jf_content_row">
          <Col span={11}>
            <Card className="jf_card" title="Input JSON">
              <TextArea
                value={jsonToCsvInput}
                onChange={(e) => setJsonToCsvInput(e.target.value)}
                placeholder={'Paste a JSON array of objects, e.g.\n[{"name":"Alice","age":30}]'}
                className="jf_textarea"
              />
            </Card>
          </Col>

          <Col span={2} className="jf_middle_actions">
            <Space direction="vertical" align="center">
              <Button type="primary" block onClick={handleJsonToCsv} disabled={!jsonToCsvInput}>
                Convert →
              </Button>
              <Button danger icon={<Trash2 size={14} />} block onClick={handleJsonToCsvClear}>
                Clear
              </Button>
            </Space>
          </Col>

          <Col span={11}>
            <Card
              className="jf_card"
              title="Output CSV"
              extra={
                jsonToCsvOutput && (
                  <Button size="small" icon={<Copy size={14} />} onClick={handleJsonToCsvCopy}>
                    Copy
                  </Button>
                )
              }
            >
              <TextArea
                value={jsonToCsvOutput}
                readOnly
                placeholder="CSV output will appear here..."
                className="jf_textarea jf_output"
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'csv-to-json',
      label: 'CSV → JSON',
      children: (
        <Row gutter={[16, 16]} align="stretch" className="jf_content_row">
          <Col span={11}>
            <Card className="jf_card" title="Input CSV">
              <TextArea
                value={csvToJsonInput}
                onChange={(e) => setCsvToJsonInput(e.target.value)}
                placeholder={'Paste CSV with a header row, e.g.\nname,age\nAlice,30\nBob,25'}
                className="jf_textarea"
              />
            </Card>
          </Col>

          <Col span={2} className="jf_middle_actions">
            <Space direction="vertical" align="center">
              <Button type="primary" block onClick={handleCsvToJson} disabled={!csvToJsonInput}>
                Convert →
              </Button>
              <Button danger icon={<Trash2 size={14} />} block onClick={handleCsvToJsonClear}>
                Clear
              </Button>
            </Space>
          </Col>

          <Col span={11}>
            <Card
              className="jf_card"
              title="Output JSON"
              extra={
                csvToJsonOutput && (
                  <Button size="small" icon={<Copy size={14} />} onClick={handleCsvToJsonCopy}>
                    Copy
                  </Button>
                )
              }
            >
              <TextArea
                value={csvToJsonOutput}
                readOnly
                placeholder="JSON output will appear here..."
                className="jf_textarea jf_output"
              />
            </Card>
          </Col>
        </Row>
      )
    }
  ]

  return (
    <div className="JsonFormatterPage">
      <PageHeader
        title="JSON Formatter"
        description="Beautify, minify JSON, or convert between JSON and CSV."
        icon={<Braces size={24} color="#f67373" />}
      />
      <Tabs items={tabItems} className="jf_tabs" />
    </div>
  )
}

const JsonFormatterPage = withNotification(JsonFormatterPageWOC)

export default JsonFormatterPage
