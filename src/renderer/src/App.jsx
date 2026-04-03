import { Button, ConfigProvider, Layout, Menu, notification } from 'antd'
import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Route, HashRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useFeatureConfig } from './context/featureConfigContext'
import logo from './assets/logo.png'
import iconlogo from './assets/icon-logo.png'
import './assets/main.css'
import { ROUTES } from './routing'
// import Versions from './components/Versions'
import Footer from './components/Footer'
import CommandPalette from './components/CommandPalette/CommandPalette'
import { NotificationContext } from './context/notificationContext'
import { FeatureConfigProvider } from './context/featureConfigContext'
import { AuthProvider } from './context/authContext'
import { darkTheme, lightTheme } from './theme/theme'
import NavigationBar from './components/NavigationBar'
import BottomPanel from './components/BottomPanel/BottomPanel'
import { DevPanelProvider } from './context/devPanelContext'
import { useDevPanel } from './context/useDevPanel'
// Custom theme tokens for menu states
// const menuAccent = '#f67373'
const { Header, Content, Sider } = Layout

function App() {
  const [api, contextHolder] = notification.useNotification()
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Merge custom menu accent color into theme
  const customTheme = isDark ? darkTheme : lightTheme

  return (
    <ConfigProvider theme={customTheme}>
      {contextHolder}
      <NotificationContext.Provider value={api}>
        <AuthProvider>
          <FeatureConfigProvider>
            <DevPanelProvider>
              <Router>
                <div data-theme={isDark ? 'dark' : 'light'}>
                  <AppLayout
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    isDark={isDark}
                    setIsDark={setIsDark}
                  />
                </div>
              </Router>
            </DevPanelProvider>
          </FeatureConfigProvider>
        </AuthProvider>
      </NotificationContext.Provider>
    </ConfigProvider>
  )
}

function AppLayout({ collapsed, setCollapsed, isDark, setIsDark }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { getFilteredRoutes } = useFeatureConfig()
  const { isOpen, panelHeight } = useDevPanel()

  // Map path to menu key
  const pathKey = {
    '/': '1',
    '/settings': '2',
    '/notifications': '3',
    '/backup': '4'
  }

  // Filter routes based on feature configuration
  const visibleRoutes = getFilteredRoutes(ROUTES)
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: isDark ? '#181818' : '#fff',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1001
        }}
      >
        <div style={{ height: 64, margin: 16, textAlign: 'center' }}>
          <img
            src={collapsed ? iconlogo : logo}
            alt="logo"
            style={{ width: collapsed ? 32 : 148 }}
          />
        </div>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[pathKey[location.pathname] || '1']}
          onClick={({ key }) => {
            navigate(key)
          }}
          items={visibleRoutes.map(({ path, label, icon: IconComponent, hideInMenu }) => {
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            left: collapsed ? 80 : 200,
            right: 0,
            zIndex: 1000,
            height: 64,
            padding: '0 16px'
          }}
        >
          <NavigationBar />
          <Button
            type="text"
            shape="circle"
            onClick={() => setIsDark((d) => !d)}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#fff' : '#000'
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </Header>
        <Content
          style={{
            margin: '88px 16px 24px 16px',
            marginLeft: collapsed ? '96px' : '216px',
            paddingBottom: isOpen ? panelHeight + 28 : 28
          }}
        >
          <div
            style={{
              padding: 12,
              background: isDark ? '#181818' : '#fff',
              color: isDark ? '#fff' : '#000',
              borderRadius: 8
            }}
          >
            <Routes>
              {visibleRoutes.map(({ path, element, hideInMenu }) => (
                <Route
                  className={`${hideInMenu ? 'hide' : 'show'}`}
                  key={path}
                  path={path}
                  element={element}
                />
              ))}
            </Routes>
          </div>
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
      <CommandPalette ROUTES={ROUTES} />
      <BottomPanel siderWidth={collapsed ? 80 : 200} />
    </Layout>
  )
}

export default App
