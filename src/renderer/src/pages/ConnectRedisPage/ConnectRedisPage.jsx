import { Card, Col, Row } from 'antd'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'

import ConnectionForm from './components/ConnectionForm'
import HelpDocsSidebar from './components/HelpDocsSidebar'
import KeysManager from './components/KeysManager'

const ConnectRedisPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [connected, setConnected] = useState(false)
  const [context, setContext] = useState({ pod: null, config: null })
  const [query, setQuery] = useState('')
  const [connectionLabel, setConnectionLabel] = useState('')

  return (
    <div className="ConnectRedisPage">
      <PageHeader
        title="Redis Management"
        description={
          connected && connectionLabel
            ? `Connected to ${connectionLabel}`
            : 'Securely connect and manage Redis instances via GCP Jumpbox.'
        }
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
              setConnectionLabel={setConnectionLabel}
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
