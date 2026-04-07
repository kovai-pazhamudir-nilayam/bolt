import { ConfigProvider, Layout, Menu, notification } from 'antd'
import { useState, useEffect } from 'react'
import { Route, HashRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom'
import iconlogo from './assets/icon-logo.png'
import logo from './assets/logo.png'
import './assets/main.css'
import { useAuth } from './context/authContext'
import { useFeatureConfig } from './context/featureConfigContext'
import { ROUTES } from './routing'
// import Versions from './components/Versions'
import BottomPanel from './components/BottomPanel/BottomPanel'
import CommandPalette from './components/CommandPalette/CommandPalette'
import NavigationBar from './components/NavigationBar'
import UpdateBanner from './components/UpdateBanner'
import { AuthProvider } from './context/authContext'
import { DevPanelProvider } from './context/devPanelContext'
import { FeatureConfigProvider } from './context/featureConfigContext'
import { NotificationContext } from './context/notificationContext'
import { useDevPanel } from './context/useDevPanel'
import { darkTheme, lightTheme } from './theme/theme'
// Custom theme tokens for menu states
// const menuAccent = '#f67373'
const { Header, Content, Sider } = Layout

function App() {
  const [api, contextHolder] = notification.useNotification()
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('bolt_theme') === 'dark')

  useEffect(() => {
    localStorage.setItem('bolt_theme', isDark ? 'dark' : 'light')
  }, [isDark])

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
  const { isAuthenticated } = useAuth()
  const { isOpen, panelHeight } = useDevPanel()

  // Map path to menu key
  const pathKey = {
    '/': '1',
    '/settings': '2',
    '/notifications': '3',
    '/backup': '4'
  }

  // Filter routes based on feature configuration and auth
  const visibleRoutes = getFilteredRoutes(ROUTES).filter((r) => {
    if (import.meta.env.DEV && r.path === '/feature-config') return true
    return !r.requiresAuth || isAuthenticated
  })
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
        <div className="sider-menu-scroll">
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
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            background: isDark ? '#111' : '#fff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: collapsed ? 80 : 200,
            right: 0,
            zIndex: 1000,
            height: 64,
            padding: '0 16px'
          }}
        >
          <NavigationBar isDark={isDark} setIsDark={setIsDark} />
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
          <BottomPanel siderWidth={collapsed ? 80 : 200} />
        </Layout.Footer>
      </Layout>
      <CommandPalette ROUTES={ROUTES} />
      <UpdateBanner />
    </Layout>
  )
}

export default App
