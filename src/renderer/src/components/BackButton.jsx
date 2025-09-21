import { Button } from 'antd'
import { SquareArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(-1)
  }

  return (
    <Button type="primary" size="small" onClick={handleClick} icon={<SquareArrowLeft size={16} />}>
      Back
    </Button>
  )
}

export default BackButton
