import { Card, Col, Row } from 'antd'
import PageHeader from '../../components/PageHeader/PageHeader'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Palette,
  Table,
  Network,
  Workflow,
  ServerCog,
  CloudUpload,
  FileSearch,
  ListChecks,
  Binary,
  Clock
} from 'lucide-react'

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
    name: 'Page Builder',
    description: 'Design and generate new application pages with templates.',
    path: '/tools/page-builder',
    icon: LayoutDashboard
  },
  {
    name: 'UI Builder',
    description: 'Create and customize reusable UI components visually.',
    path: '/tools/ui-builder',
    icon: Palette
  },
  {
    name: 'Table Builder',
    description: 'Configure and generate data tables with sorting and filters.',
    path: '/tools/table-builder',
    icon: Table
  },
  {
    name: 'Proxy Configurator',
    description: 'Manage and configure CC proxy rules for your app.',
    path: '/tools/proxy-builder',
    icon: Network
  },
  {
    name: 'Task Manager DI',
    description: 'Orchestrate and manage dependency-injected background tasks.',
    path: '/tools/task-manager-di',
    icon: Workflow
  },
  {
    name: 'Task Manager Config',
    description: 'Configure and orchestrate background tasks with dependency injection.',
    path: '/tools/task-manager-config',
    icon: ListChecks
  },
  {
    name: 'API Builder',
    description: 'Design, generate, and test REST APIs with schema validation.',
    path: '/tools/api-builder',
    icon: ServerCog
  },
  {
    name: 'Push Logs to GCP',
    description: 'Upload and sync local logs securely to Google Cloud Platform.',
    path: '/tools/logs-push',
    icon: CloudUpload
  },
  {
    name: 'Fetch Local Logs',
    description: 'Retrieve and view logs stored locally for debugging.',
    path: '/tools/logs-fetch',
    icon: FileSearch
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
