import { Button, Col, ConfigProvider, Layout, Menu, notification, Row } from 'antd'
import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom'
import logo from './assets/logo.png'
import './assets/main.css'
import { ROUTES } from './routing'
// import Versions from './components/Versions'
import Footer from './components/Footer'
import MasterSelectionModal from './components/MasterSelectionModal'
import { MasterDataProvider } from './context/masterDataContext'
import { NotificationContext } from './context/notificationContext'
import { darkTheme, lightTheme } from './theme/theme'
import BackButton from './components/BackButton'
// Custom theme tokens for menu states
// const menuAccent = '#f67373'
const { Header, Content, Sider } = Layout

function App() {
  const [api, contextHolder] = notification.useNotification()
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const openNotification = () => {
    api.info({
      message: 'Notification',
      description: 'This is a sample notification.',
      placement: 'topRight'
    })
  }

  // Merge custom menu accent color into theme
  const customTheme = isDark ? darkTheme : lightTheme

  return (
    <MasterDataProvider>
      <ConfigProvider theme={customTheme}>
        {contextHolder}
        <NotificationContext.Provider value={api}>
          <Router>
            <AppLayout
              openNotification={openNotification}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              isDark={isDark}
              setIsDark={setIsDark}
            />
          </Router>
        </NotificationContext.Provider>
      </ConfigProvider>
    </MasterDataProvider>
  )
}

function AppLayout({ openNotification, collapsed, setCollapsed, isDark, setIsDark }) {
  const navigate = useNavigate()
  const location = useLocation()
  // Map path to menu key
  const pathKey = {
    '/': '1',
    '/settings': '2',
    '/notifications': '3',
    '/backup': '4'
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: isDark ? '#181818' : '#fff' }}
      >
        <div style={{ height: 64, margin: 16, textAlign: 'center' }}>
          <img src={logo} alt="logo" style={{ width: 148 }} />
        </div>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[pathKey[location.pathname] || '1']}
          onClick={({ key }) => {
            navigate(key)
          }}
          items={ROUTES.map(({ path, label, icon: IconComponent, hideInMenu }) => {
            return {
              key: path,
              icon: <IconComponent size={18} />,
              label,
              className: hideInMenu ? 'hide' : 'show'
            }
          })}
          style={{ background: isDark ? '#181818' : '#fff', color: isDark ? '#fff' : '#000' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: isDark ? '#111' : '#fff',
            color: isDark ? '#fff' : '#000',
            fontSize: 20,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Bolt Dashboard</span>
            <MasterSelectionModal />
          </div> */}
        </Header>
        {/* Floating Theme Toggle Button */}
        <Button
          type="primary"
          shape="circle"
          onClick={() => setIsDark((d) => !d)}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? '#222' : '#fff',
            color: isDark ? '#fff' : '#000',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </Button>
        <Row>
          <Col>
            <BackButton />
          </Col>
        </Row>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: isDark ? '#181818' : '#fff',
            color: isDark ? '#fff' : '#000',
            borderRadius: 8
          }}
        >
          <Routes>
            {ROUTES.map(({ path, element, hideInMenu }) => (
              <Route
                className={`${hideInMenu ? 'hide' : 'show'}`}
                key={path}
                path={path}
                element={element}
              />
            ))}
          </Routes>
        </Content>
        <Layout.Footer
          style={{
            textAlign: 'center',
            background: 'transparent',
            color: isDark ? '#fff' : '#000',
            fontSize: 13,
            padding: 8
          }}
        >
          {<Footer />}
        </Layout.Footer>
      </Layout>
    </Layout>
  )
}

export default App
