import { Row, Col, Card, Alert } from 'antd'
import { Info } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'

import ConnectionForm from './components/ConnectionForm'
import KeysManager from './components/KeysManager'
import HelpDocsSidebar from './components/HelpDocsSidebar'

const ConnectRedisPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [connected, setConnected] = useState(false)
  const [context, setContext] = useState({ pod: null, config: null })
  const [query, setQuery] = useState('')

  return (
    <div className="ConnectRedisPage">
      <PageHeader
        title="Redis Management"
        description="Securely connect and manage Redis instances via GCP Jumpbox."
      />

      <Row gutter={[24, 24]}>
        {/* Main Section */}
        <Col span={18}>
          <Card bordered={false} className="main-card">
            <ConnectionForm
              renderErrorNotification={renderErrorNotification}
              renderSuccessNotification={renderSuccessNotification}
              connected={connected}
              setConnected={setConnected}
              setContext={setContext}
            />

            {connected && (
              <KeysManager
                context={context}
                renderErrorNotification={renderErrorNotification}
                renderSuccessNotification={renderSuccessNotification}
                query={query}
                setQuery={setQuery}
              />
            )}

            {!connected && (
              <Alert
                message="Not Connected"
                description="Please select a company and environment to establish a connection to Redis."
                type="info"
                showIcon
                icon={<Info />}
              />
            )}
          </Card>
        </Col>

        {/* Info Sidebar */}
        <Col span={6}>
          <HelpDocsSidebar onCommandClick={(cmd) => setQuery(cmd)} />
        </Col>
      </Row>
    </div>
  )
}

const ConnectRedisPage = withNotification(ConnectRedisPageWoc)

export default ConnectRedisPage
