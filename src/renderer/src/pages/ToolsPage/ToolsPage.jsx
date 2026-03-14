import { Card, Col, Row } from 'antd'
import { Binary, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader/PageHeader'

import './ToolsPage.less'

const TOOLS = [
  {
    name: 'Base64 Tool',
    description: 'Encode and decode text to/from Base64 format easily.',
    path: '/tools/base64',
    icon: Binary
  },
  {
    name: 'Time Converter',
    description: 'Convert between Epoch, IST, and UTC time formats.',
    path: '/tools/time-converter',
    icon: Clock
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens (JWT) easily.',
    path: '/tools/jwt-decoder',
    icon: Binary
  }
]
const ToolsPage = () => {
  return (
    <div className="ToolsPage">
      <PageHeader
        title="Tools"
        description="Manage all tools entities including companies, environments, users, and configurations."
      />
      <Row gutter={[16, 16]} align="stretch">
        {TOOLS.map(({ name, description, path, icon: IconComponent }) => {
          return (
            <Col className="tool_container" span={4} key={name}>
              <Link className="tool_link" to={path}>
                <Card size="small" style={{ height: '100%' }}>
                  <Row>
                    <Col span={24}>
                      <IconComponent className="tool_icon" size={40} />
                    </Col>
                    <Col span={24}>
                      <div className="tool_name">{name}</div>
                      <div className="tool_description">{description}</div>
                    </Col>
                  </Row>
                </Card>
              </Link>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

export default ToolsPage
