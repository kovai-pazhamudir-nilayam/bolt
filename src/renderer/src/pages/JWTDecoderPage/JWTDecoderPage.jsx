import { Button, Card, Col, Input, Row, Space, Typography } from 'antd'
import { Binary, Copy, Trash2, AlertCircle } from 'lucide-react'
import { useState, useMemo } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import './JWTDecoderPage.less'

const { TextArea } = Input
const { Title, Text } = Typography

const JWTDecoderPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [token, setToken] = useState('')

  const decoded = useMemo(() => {
    if (!token) return null

    const parts = token.split('.')
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format. A JWT should have 3 parts separated by dots.' }
    }

    const decodePart = (part) => {
      try {
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
        const decodedStr = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join('')
        )
        return JSON.parse(decodedStr)
      } catch {
        renderErrorNotification({
          message: 'Failed to decode part: ' + part.substring(0, 10) + '...'
        })
        return { error: 'Failed to decode part' }
      }
    }

    return {
      header: decodePart(parts[0]),
      payload: decodePart(parts[1]),
      signature: parts[2]
    }
  }, [token, renderErrorNotification])

  const handleCopy = (text) => {
    if (!text) return
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2))
    renderSuccessNotification({ message: 'Copied to clipboard.' })
  }

  const handleClear = () => {
    setToken('')
  }

  const handleTokenChange = (e) => {
    let value = e.target.value
    if (value.toLowerCase().startsWith('bearer ')) {
      value = value.substring(7)
    }
    setToken(value.trim())
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp || typeof timestamp !== 'number') return null
    try {
      const date = new Date(timestamp * 1000)
      return (
        date.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'medium'
        }) + ' IST'
      )
    } catch {
      return null
    }
  }

  const timestampFields = useMemo(() => {
    if (!decoded || !decoded.payload || typeof decoded.payload !== 'object') return []
    const fields = {
      iat: 'Issued At (iat)',
      exp: 'Expiration Time (exp)',
      nbf: 'Not Before (nbf)',
      auth_time: 'Authentication Time (auth_time)',
      updated_at: 'Updated At (updated_at)'
    }

    const now = Math.floor(Date.now() / 1000)

    return Object.keys(fields)
      .filter((field) => decoded.payload[field])
      .map((field) => {
        const val = decoded.payload[field]
        let extraInfo = ''
        let isExpired = false

        if (field === 'exp') {
          isExpired = val < now
          extraInfo = isExpired ? ' (Expired)' : ' (Valid)'
        }

        return {
          label: fields[field],
          value: formatTimestamp(val) + extraInfo,
          isExpired,
          field
        }
      })
      .filter((item) => item.value)
  }, [decoded])

  const HighlightedInput = ({ value, onChange }) => {
    const parts = value.split('.')

    const renderHighlighted = () => {
      if (!value) return null
      return (
        <div className="highlighted_overlay">
          {parts[0] && <span className="jwt_header">{parts[0]}</span>}
          {value.includes('.') && <span className="jwt_dot">.</span>}
          {parts[1] && <span className="jwt_payload">{parts[1]}</span>}
          {parts.filter((_, i) => i > 1).length > 0 && <span className="jwt_dot">.</span>}
          {parts[2] && <span className="jwt_signature">{parts[2]}</span>}
        </div>
      )
    }

    return (
      <div className="jwt_input_container">
        {renderHighlighted()}
        <TextArea
          value={value}
          onChange={onChange}
          placeholder="Paste your JWT here..."
          className="jwt_textarea side_textarea"
          autoSize={{ minRows: 20, maxRows: 20 }}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    )
  }

  return (
    <div className="JWTDecoderPage">
      <PageHeader
        title="JWT Decoder"
        description="Decode and inspect JSON Web Tokens (JWT) headers and payloads."
        icon={<Binary size={24} color="#f67373" />}
      />
      <Row gutter={[16, 16]} align="stretch" className="jwt_content_row">
        <Col span={10}>
          <Card className="jwt_card" title="Encoded Token">
            <HighlightedInput value={token} onChange={handleTokenChange} />
            <div style={{ marginTop: '16px' }}>
              <Button danger icon={<Trash2 size={16} />} onClick={handleClear} block title="Clear">
                Clear Token
              </Button>
            </div>
          </Card>
        </Col>

        <Col span={14}>
          <Card className="jwt_card" title="Decoded Result">
            {token && decoded && decoded.error ? (
              <div className="error_message">
                <AlertCircle size={20} color="#ff4d4f" />
                <Text type="danger">{decoded.error}</Text>
              </div>
            ) : token ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <div className="section_header header_section">
                    <Title level={5}>Header: Algorithm & Token Type</Title>
                    <Button
                      size="small"
                      icon={<Copy size={14} />}
                      onClick={() => handleCopy(decoded.header)}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="json_viewer">{JSON.stringify(decoded.header, null, 2)}</pre>
                </div>

                {timestampFields.length > 0 && (
                  <div>
                    <div className="section_header">
                      <Title level={5}>Time Information (IST)</Title>
                    </div>
                    <div className="timestamp_info">
                      {timestampFields.map((field) => (
                        <div key={field.label} className="timestamp_row">
                          <Text strong className="timestamp_label">
                            {field.label}:
                          </Text>
                          <Text
                            className={`timestamp_value ${field.isExpired ? 'expired_text' : ''}`}
                          >
                            {field.value}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="section_header payload_section">
                    <Title level={5}>Payload: Data</Title>
                    <Button
                      size="small"
                      icon={<Copy size={14} />}
                      onClick={() => handleCopy(decoded.payload)}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="json_viewer">{JSON.stringify(decoded.payload, null, 2)}</pre>
                </div>

                <div>
                  <div className="section_header signature_section">
                    <Title level={5}>Signature</Title>
                  </div>
                  <Text type="secondary" className="signature_text">
                    {decoded.signature}
                  </Text>
                </div>
              </Space>
            ) : (
              <div className="empty_state">
                <Text type="secondary">Enter a JWT to see its content decoded here.</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const JWTDecoderPage = withNotification(JWTDecoderPageWOC)

export default JWTDecoderPage
