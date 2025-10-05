/* eslint-disable react/prop-types */

import { Alert, Button, Space, Spin, Typography } from 'antd'
import { Building2, ExternalLink, Info, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import CustomTabs from '../../components/CustomTabs/CustomTabs'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import './OsTicketPage.less'

const { Title, Paragraph } = Typography

const { companyRepo } = settingsFactory()

const OsTicketPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [embeddedUrl, setEmbeddedUrl] = useState(null)
  const [showIframe, setShowIframe] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(false)

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const data = await companyRepo.getAll()
      setCompanies(data)
      if (data.length > 0) {
        // Auto-embed if the first company has a support portal
        if (data[0].support_portal_url) {
          try {
            setIframeLoading(true)

            if (!window.webviewAPI?.embed) {
              setIframeLoading(false)
              return
            }

            // Setup iframe embedding
            await window.webviewAPI.embed(data[0].support_portal_url)

            // Set the URL and show iframe
            setEmbeddedUrl(data[0].support_portal_url)
            setShowIframe(true)
            setIframeLoading(false)
          } catch (error) {
            console.error('Error auto-embedding iframe:', error)
            setIframeLoading(false)
          }
        }
      }
    } catch {
      renderErrorNotification({ message: 'Failed to load companies' })
    } finally {
      setLoading(false)
    }
  }, [renderErrorNotification])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const handleOpenExternal = (url, companyName) => {
    try {
      // Try shellAPI first, then fallback to electron API
      if (window.shellAPI?.openExternal) {
        window.shellAPI.openExternal(url)
        renderSuccessNotification({
          message: `Opening ${companyName} support portal in external browser`
        })
      } else if (window.electron?.shell?.openExternal) {
        window.electron.shell.openExternal(url)
        renderSuccessNotification({
          message: `Opening ${companyName} support portal in external browser`
        })
      } else {
        throw new Error('No external browser API available')
      }
    } catch (error) {
      console.error('Error opening external browser:', error)
      renderErrorNotification({
        message: `Failed to open external browser: ${error.message}`
      })
    }
  }

  const renderCompanyTab = (company) => {
    const hasSupportPortal = company.support_portal_url

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

          {hasSupportPortal ? (
            <>
              {showIframe && embeddedUrl ? (
                <div>
                  <div className="company-header">
                    <div>
                      <strong>Portal URL:</strong>
                      <code className="portal-url-code">{company.support_portal_url}</code>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        icon={<RefreshCw size={16} />}
                        onClick={() => {
                          setIframeLoading(true)
                          // Force webview refresh by changing src
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
                          handleOpenExternal(embeddedUrl, 'Support Portal')
                        }}
                        type="text"
                      >
                        Open in External Browser
                      </Button>
                    </Space>
                  </div>
                  <div className="webview-container">
                    {iframeLoading && (
                      <div className="webview-loading-overlay">
                        <Spin size="large" />
                      </div>
                    )}
                    <webview
                      src={embeddedUrl}
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
                              handleOpenExternal(embeddedUrl, 'Support Portal')
                            }, 1000)
                          })
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="info-alert">
                  <Alert
                    message="Support Portal Access"
                    description="The support portal will be automatically embedded in this page. You can also open it in a dedicated window within the app or in your external browser using the buttons above."
                    type="info"
                    icon={<Info size={16} />}
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                </div>
              )}
            </>
          ) : (
            <Alert
              message="Support Portal Not Configured"
              description={`No support portal URL has been configured for ${company.company_name}. Please configure it in the Settings > Company Settings.`}
              type="warning"
              icon={<Info size={16} />}
              showIcon
            />
          )}
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

  const tabItems = companies.map((company) => ({
    key: company.company_code,
    label: company.company_name,
    children: renderCompanyTab(company)
  }))

  return (
    <div className="os-ticket-page">
      <PageHeader
        title="Support Portals"
        description="Access company support portals for ticket management and support requests."
      />

      <CustomTabs items={tabItems} size="large" />
    </div>
  )
}

const OsTicketPage = withNotification(OsTicketPageWoc)

export default OsTicketPage
