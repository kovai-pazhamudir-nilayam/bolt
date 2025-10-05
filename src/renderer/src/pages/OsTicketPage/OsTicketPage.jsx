/* eslint-disable react/prop-types */

import { Button, Card, Col, Row, Space, Typography, Alert, Tabs, Spin } from 'antd'
import { ExternalLink, Info, Building2 } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'

const { Title, Paragraph } = Typography

const { companyRepo } = settingsFactory()

const OsTicketPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [embeddedUrl, setEmbeddedUrl] = useState(null)
  const [showIframe, setShowIframe] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(false)

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const data = await companyRepo.getAll()
      setCompanies(data)
      if (data.length > 0) {
        setActiveTab(data[0].company_code)
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

  useEffect(() => {
    // Check webview API availability
    console.log('Webview API available:', !!window.webviewAPI)
  }, [])

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

  const handleOpenInApp = async (url, companyName) => {
    try {
      if (!window.webviewAPI?.open) {
        throw new Error('Webview API not available')
      }

      await window.webviewAPI.open(url, {
        width: 1400,
        height: 900,
        title: `${companyName} Support Portal`
      })

      renderSuccessNotification({
        message: `Opening ${companyName} support portal in app window`
      })
    } catch (error) {
      console.error('Error opening webview:', error)
      renderErrorNotification({
        message: `Failed to open support portal in app window: ${error.message}`
      })
    }
  }

  // Handle iframe navigation and session management
  const handleIframeMessage = (event) => {
    // Handle messages from the iframe if needed
    console.log('Iframe message received:', event.data)
  }

  // Set up message listener for iframe communication
  useEffect(() => {
    if (showIframe) {
      window.addEventListener('message', handleIframeMessage)
      return () => {
        window.removeEventListener('message', handleIframeMessage)
      }
    }
  }, [showIframe])

  const handleTabChange = async (companyCode) => {
    setActiveTab(companyCode)

    // Find the company and auto-embed if it has a support portal
    const company = companies.find((c) => c.company_code === companyCode)
    if (company && company.support_portal_url) {
      try {
        setIframeLoading(true)

        if (!window.webviewAPI?.embed) {
          setIframeLoading(false)
          return
        }

        // Setup iframe embedding
        await window.webviewAPI.embed(company.support_portal_url)

        // Set the URL and show iframe
        setEmbeddedUrl(company.support_portal_url)
        setShowIframe(true)
        setIframeLoading(false)
      } catch (error) {
        console.error('Error auto-embedding iframe:', error)
        setIframeLoading(false)
      }
    } else {
      // Close iframe if no support portal
      setShowIframe(false)
      setEmbeddedUrl(null)
      setIframeLoading(false)
    }
  }

  const renderCompanyTab = (company) => {
    const hasSupportPortal = company.support_portal_url

    return (
      <div style={{ padding: '16px 0' }}>
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
              <div style={{ marginBottom: 16 }}>
                <Space size="middle" wrap>
                  <Button
                    size="large"
                    icon={<ExternalLink size={18} />}
                    onClick={() =>
                      handleOpenInApp(company.support_portal_url, company.company_name)
                    }
                  >
                    Open in App Window
                  </Button>
                  <Button
                    size="large"
                    icon={<ExternalLink size={18} />}
                    onClick={() =>
                      handleOpenExternal(company.support_portal_url, company.company_name)
                    }
                  >
                    Open in External Browser
                  </Button>
                </Space>
              </div>

              {showIframe && embeddedUrl ? (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'end',
                      alignItems: 'center',
                      marginBottom: 8
                    }}
                  >
                    <Space>
                      <Button
                        size="small"
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
                        onClick={() => {
                          // Fallback: open in app window if webview fails
                          handleOpenInApp(embeddedUrl, 'Support Portal')
                        }}
                        type="text"
                      >
                        Open in Window
                      </Button>
                    </Space>
                  </div>
                  <div
                    style={{
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      height: '600px',
                      position: 'relative'
                    }}
                  >
                    {iframeLoading && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f5f5f5',
                          zIndex: 1
                        }}
                      >
                        <Spin size="large" />
                      </div>
                    )}
                    <webview
                      src={embeddedUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        opacity: iframeLoading ? 0 : 1,
                        transition: 'opacity 0.3s ease'
                      }}
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
                              handleOpenInApp(embeddedUrl, 'Support Portal')
                            }, 1000)
                          })
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
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

              <div style={{ marginTop: 16 }}>
                <Card size="small" style={{ background: '#f8f9fa' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <strong>Portal URL:</strong>
                      <br />
                      <code
                        style={{
                          background: '#e9ecef',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {company.support_portal_url}
                      </code>
                    </div>
                  </Space>
                </Card>
              </div>
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading companies...</div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div>
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
    <div>
      <PageHeader
        title="Support Portals"
        description="Access company support portals for ticket management and support requests."
      />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
              type="card"
              size="large"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const OsTicketPage = withNotification(OsTicketPageWoc)

export default OsTicketPage
