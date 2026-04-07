import { useEffect, useState } from 'react'
import { Button, Col, Row, Space, Spin } from 'antd'
import { Undo2, Redo2, RefreshCw, Home, LogIn, LogOut, Moon, Sun } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import LoginModal from './LoginModal'
import UpdateBanner from './UpdateBanner'

const NavigationBar = ({ isDark, setIsDark }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, isAuthenticated, logout } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Hide loader once navigation completes (location.key changes on navigate(0))
  useEffect(() => {
    setRefreshing(false)
  }, [location.key])

  const handleBack = () => navigate(-1)
  const handleForward = () => navigate(1)
  const handleRefresh = () => {
    setRefreshing(true)
    navigate(location.pathname, { replace: true })
  }
  const handleHome = () => navigate('/welcome')

  const showLoginModal = () => {
    setIsLoginModalOpen(true)
  }

  const handleLogout = () => {
    logout()
    // Optional: Navigate to home or refresh after logout
  }

  return (
    <>
      <Row justify="space-between" align="middle" style={{ width: '100%' }}>
        <Col>
          <Row gutter={8} wrap={false}>
            <Col>
              <Button type="primary" onClick={handleBack} icon={<Undo2 size={16} />} />
            </Col>
            <Col>
              <Button type="primary" onClick={handleForward} icon={<Redo2 size={16} />} />
            </Col>
            <Col>
              <Button type="primary" onClick={handleRefresh} icon={<RefreshCw size={16} />} />
            </Col>
            <Col>
              <Button type="primary" onClick={handleHome} icon={<Home size={16} />} />
            </Col>
          </Row>
        </Col>

        <Col flex="auto" style={{ display: 'flex', justifyContent: 'center' }}>
          <UpdateBanner />
        </Col>

        <Col>
          <Row gutter={8} align="middle">
            <Col>
              {setIsDark && (
                <Button
                  type="text"
                  shape="circle"
                  onClick={() => setIsDark((d) => !d)}
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
              )}
            </Col>
            <Col>
              {isAuthenticated ? (
                <Space>
                  <span style={{ marginLeft: 8, marginRight: 8 }}>{user?.name}</span>
                  <Button onClick={handleLogout} icon={<LogOut size={16} />} />
                </Space>
              ) : (
                <Button type="primary" onClick={showLoginModal} icon={<LogIn size={16} />} />
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}

      {refreshing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)'
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </>
  )
}

export default NavigationBar
