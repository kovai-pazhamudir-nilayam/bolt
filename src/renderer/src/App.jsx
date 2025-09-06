import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { ConfigProvider, Layout, Menu, theme, Button, notification } from 'antd'
import { useState } from 'react'
const { Header, Content, Sider } = Layout


function App() {
  const [api, contextHolder] = notification.useNotification()
  const [collapsed, setCollapsed] = useState(false)
  const openNotification = () => {
    api.info({
      message: 'Notification',
      description: 'This is a sample notification.',
      placement: 'topRight'
    })
  }

  // Black & white AntD theme tokens
  const customTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#fff',
      colorBgBase: '#111',
      colorTextBase: '#fff',
      colorText: '#fff',
      colorBgContainer: '#181818',
      colorBorder: '#333',
      borderRadius: 8
    },
    components: {
      Button: {
        colorPrimary: '#fff',
        colorBgContainer: '#111',
        colorText: '#fff',
        colorBorder: '#fff'
      },
      Layout: {
        colorBgHeader: '#111',
        colorBgSider: '#181818',
        colorBgBase: '#111'
      },
      Menu: {
        colorItemBg: '#181818',
        colorItemText: '#fff',
        colorItemTextHover: '#000',
        colorItemBgSelected: '#fff',
        colorItemTextSelected: '#000'
      }
    }
  }

  return (
    <ConfigProvider theme={customTheme}>
      {contextHolder}
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: '#181818' }}
        >
          <div style={{ height: 64, margin: 16, textAlign: 'center' }}>
            <img src={electronLogo} alt="logo" style={{ width: 48, filter: 'invert(1)' }} />
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              { key: '1', label: 'Dashboard' },
              { key: '2', label: 'Settings' },
              { key: '3', label: 'Notifications' }
            ]}
            style={{ background: '#181818', color: '#fff' }}
          />
        </Sider>
        <Layout>
          <Header style={{ background: '#111', color: '#fff', fontSize: 20, fontWeight: 700 }}>
            Bolt Dashboard
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              background: '#181818',
              color: '#fff',
              borderRadius: 8
            }}
          >
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div
                style={{ flex: 1, minWidth: 240, background: '#222', padding: 16, borderRadius: 8 }}
              >
                <h2 style={{ color: '#fff' }}>Widget 1</h2>
                <p style={{ color: '#fff' }}>This is a sample widget.</p>
                <Button
                  type="primary"
                  onClick={openNotification}
                  style={{ background: '#fff', color: '#000' }}
                >
                  Show Notification
                </Button>
              </div>
              <div
                style={{ flex: 1, minWidth: 240, background: '#222', padding: 16, borderRadius: 8 }}
              >
                <h2 style={{ color: '#fff' }}>Widget 2</h2>
                <p style={{ color: '#fff' }}>Another widget area.</p>
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              <Versions />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
