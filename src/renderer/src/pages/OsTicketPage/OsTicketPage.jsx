import { Alert, Button, Space, Spin, Typography } from 'antd'
import { Building2, ExternalLink, Info, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import CustomTabs from '../../components/CustomTabs/CustomTabs'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import './OsTicketPage.less'

const { Title, Paragraph } = Typography

const { companyRepo } = settingsFactory()

const NoCompaniesConfigured = () => {
  return (
    <div className="os-ticket-page">
      <PageHeader
        title="Support Portals"
        description="Access company support portals for ticket management and support requests."
      />
      <Alert
        message="No Companies Found"
        description="Please add companies and configure their support portal URLs in Settings > Company Settings."
        type="warning"
        showIcon
      />
    </div>
  )
}

const SupportPortalNotConfigured = ({ company }) => {
  return (
    <Alert
      message="Support Portal Not Configured"
      description={`No support portal URL has been configured for ${company.company_name}. Please configure it in the Settings > Company Settings.`}
      type="warning"
      icon={<Info size={16} />}
      showIcon
    />
  )
}

const WebviewActions = ({ setIframeLoading, handleOpenExternal, supportPortalUrl }) => {
  return (
    <Space>
      <Button
        size="small"
        icon={<RefreshCw size={16} />}
        onClick={() => {
          setIframeLoading(true)
          const webview = document.querySelector('webview[title="Support Portal"]')
          if (webview) {
            const currentSrc = webview.src
            webview.src = ''
            setTimeout(() => {
              webview.src = currentSrc
            }, 100)
          }
        }}
        type="text"
      >
        Refresh
      </Button>
      <Button
        size="small"
        icon={<ExternalLink size={16} />}
        onClick={() => {
          // Fallback: open in app window if webview fails
          handleOpenExternal(supportPortalUrl, 'Support Portal')
        }}
        type="text"
      >
        Open in External Browser
      </Button>
    </Space>
  )
}

const WebviewHeader = ({ company, setIframeLoading, handleOpenExternal, supportPortalUrl }) => {
  return (
    <div className="company-header">
      <div>
        <strong>Portal URL:</strong>
        <code className="portal-url-code">{company.support_portal_url}</code>
      </div>
      <WebviewActions
        setIframeLoading={setIframeLoading}
        handleOpenExternal={handleOpenExternal}
        supportPortalUrl={supportPortalUrl}
      />
    </div>
  )
}

const OsTicketPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [iframeLoading, setIframeLoading] = useState(false)

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const data = await companyRepo.getAll()
      setCompanies(data)
    } catch {
      renderErrorNotification({ message: 'Failed to load companies' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleOpenExternal = (url, companyName) => {
    try {
      window.shellAPI.openExternal(url)
      renderSuccessNotification({
        message: `Opening ${companyName} support portal in external browser`
      })
    } catch (error) {
      console.error('Error opening external browser:', error)
      renderErrorNotification({
        message: `Failed to open external browser: ${error.message}`
      })
    }
  }

  const renderCompanyTab = (company) => {
    const supportPortalUrl = company.support_portal_url

    return (
      <div className="company-tab-content">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>
              <Building2 size={20} style={{ marginRight: 8 }} />
              {company.company_name} Support Portal
            </Title>
            <Paragraph>
              Access the {company.company_name} helpdesk support portal to manage tickets, submit
              support requests, and track the status of your issues.
            </Paragraph>
          </div>

          <>
            {supportPortalUrl ? (
              <div>
                <WebviewHeader
                  company={company}
                  setIframeLoading={setIframeLoading}
                  handleOpenExternal={handleOpenExternal}
                  supportPortalUrl={supportPortalUrl}
                />
                <div className="webview-container">
                  {iframeLoading && (
                    <div className="webview-loading-overlay">
                      <Spin size="large" />
                    </div>
                  )}
                  <webview
                    src={supportPortalUrl}
                    className={`webview ${iframeLoading ? 'loading' : 'loaded'}`}
                    // eslint-disable-next-line react/no-unknown-property
                    partition="persist:webview-session"
                    // eslint-disable-next-line react/no-unknown-property
                    preload=""
                    // eslint-disable-next-line react/no-unknown-property
                    nodeintegration="false"
                    // eslint-disable-next-line react/no-unknown-property
                    websecurity="false"
                    // eslint-disable-next-line react/no-unknown-property
                    allowpopups="true"
                    title="Support Portal"
                    ref={(webview) => {
                      if (webview) {
                        webview.addEventListener('dom-ready', () => {
                          setIframeLoading(false)
                        })
                        webview.addEventListener('did-fail-load', (e) => {
                          console.error('Webview load error:', e)
                          setIframeLoading(false)
                          // Auto-fallback to window if webview fails
                          setTimeout(() => {
                            handleOpenExternal(supportPortalUrl, 'Support Portal')
                          }, 1000)
                        })
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <SupportPortalNotConfigured company={company} />
            )}
          </>
        </Space>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="os-ticket-page">
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-text">Loading companies...</div>
        </div>
      </div>
    )
  }

  if (companies.length === 0) {
    return <NoCompaniesConfigured />
  }

  return (
    <div className="os-ticket-page">
      <PageHeader
        title="Support Portals"
        description="Access company support portals for ticket management and support requests."
      />

      <CustomTabs
        items={companies.map((company) => ({
          key: company.company_code,
          label: company.company_code,
          children: renderCompanyTab(company)
        }))}
        size="large"
      />
    </div>
  )
}

const OsTicketPage = withNotification(OsTicketPageWoc)

export default OsTicketPage
