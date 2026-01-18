import { useState } from 'react'
import { Button, Space } from 'antd'
import { Undo2, Redo2, RefreshCw, Home, LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import LoginModal from './LoginModal'

const NavigationBar = () => {
  const navigate = useNavigate()

  const { user, isAuthenticated, logout } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleBack = () => navigate(-1)
  const handleForward = () => navigate(1)
  const handleRefresh = () => window.location.reload()
  const handleHome = () => navigate('/welcome') // 👈 your welcome page route

  const showLoginModal = () => {
    setIsLoginModalOpen(true)
  }

  const handleLogout = () => {
    logout()
    // Optional: Navigate to home or refresh after logout
  }

  return (
    <>
      <Space>
        <Button type="primary" onClick={handleBack} icon={<Undo2 size={16} />} />
        <Button type="primary" onClick={handleForward} icon={<Redo2 size={16} />} />
        <Button type="primary" onClick={handleRefresh} icon={<RefreshCw size={16} />} />
        <Button type="primary" onClick={handleHome} icon={<Home size={16} />} />

        {isAuthenticated ? (
          <Space>
            {/* Show user info or avatar if desired, for now just Logout */}
            <span style={{ marginLeft: 8, marginRight: 8 }}>{user?.name}</span>
            <Button onClick={handleLogout} icon={<LogOut size={16} />}>
              Logout
            </Button>
          </Space>
        ) : (
          <Button type="primary" onClick={showLoginModal} icon={<LogIn size={16} />}>
            Login
          </Button>
        )}
      </Space>

      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}

export default NavigationBar
