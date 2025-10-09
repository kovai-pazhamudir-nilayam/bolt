import { Button, Space } from 'antd'
import { Undo2, Redo2, RefreshCw, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NavigationBar = () => {
  const navigate = useNavigate()

  const handleBack = () => navigate(-1)
  const handleForward = () => navigate(1)
  const handleRefresh = () => window.location.reload()
  const handleHome = () => navigate('/welcome') // 👈 your welcome page route

  return (
    <Space>
      <Button type="primary" onClick={handleBack} icon={<Undo2 size={16} />} />
      <Button type="primary" onClick={handleForward} icon={<Redo2 size={16} />} />
      <Button type="primary" onClick={handleRefresh} icon={<RefreshCw size={16} />} />
      <Button type="primary" onClick={handleHome} icon={<Home size={16} />} />
    </Space>
  )
}

export default NavigationBar
