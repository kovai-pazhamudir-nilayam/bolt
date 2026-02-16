import { Button, Card, Col, Input, Row, Space } from 'antd'
import { ArrowLeftRight, Binary, Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import './Base64Page.less'

const { TextArea } = Input

const Base64PageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleEncode = () => {
    try {
      // Support for Unicode characters
      const encoded = btoa(
        encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16))
        })
      )
      setOutput(encoded)
    } catch {
      renderErrorNotification({ message: 'Invalid input for Base64 encoding' })
    }
  }

  const handleDecode = () => {
    try {
      // Support for Unicode characters
      const decoded = decodeURIComponent(
        atob(input)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join('')
      )
      setOutput(decoded)
    } catch {
      renderErrorNotification({ message: 'Invalid Base64 string' })
    }
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    renderSuccessNotification({ message: 'Result has been copied to clipboard.' })
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  const handleSwap = () => {
    setInput(output)
    setOutput(input)
  }

  const isBase64 = (str) => {
    if (!str || str.trim() === '') return false
    try {
      return btoa(atob(str)) === str.trim()
    } catch {
      return false
    }
  }

  const inputIsBase64 = isBase64(input)

  return (
    <div className="Base64Page">
      <PageHeader
        title="Base64 Encoder/Decoder"
        description="Encode or decode text to and from Base64 format."
        icon={<Binary size={24} color="#f67373" />}
      />
      <Row gutter={[16, 16]} align="stretch" className="base64_content_row">
        <Col span={11}>
          <Card className="base64_card" title="Input">
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode or decode..."
              className="base64_textarea side_textarea"
            />
          </Card>
        </Col>

        <Col span={2} className="middle_actions">
          <Space direction="vertical" align="center">
            <Button type="primary" onClick={handleEncode} block disabled={inputIsBase64 || !input}>
              Encode &gt;
            </Button>
            <Button type="primary" onClick={handleDecode} block disabled={!inputIsBase64}>
              &lt; Decode
            </Button>
            <Button icon={<ArrowLeftRight size={16} />} onClick={handleSwap} block title="Swap">
              Swap
            </Button>
            <Button danger icon={<Trash2 size={16} />} onClick={handleClear} block title="Clear">
              Clear
            </Button>
          </Space>
        </Col>

        <Col span={11}>
          <Card
            className="base64_card"
            title="Output"
            extra={
              output && (
                <Button size="small" icon={<Copy size={14} />} onClick={handleCopy}>
                  Copy
                </Button>
              )
            }
          >
            <TextArea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="base64_textarea output_textarea side_textarea"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const Base64Page = withNotification(Base64PageWOC)

export default Base64Page
