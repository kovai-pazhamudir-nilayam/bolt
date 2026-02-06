import { Typography } from 'antd'
import { Notebook } from 'lucide-react'

const { Text, Title } = Typography

const EmptyNotes = () => {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <div className="empty-illustration">
          <Notebook size={80} strokeWidth={1} />
        </div>
        <Title level={3} className="empty-title">
          Your Creative Space
        </Title>
        <Text className="empty-description">
          Select an existing note from the sidebar or create a new one to start capturing your
          thoughts and ideas.
        </Text>
      </div>
    </div>
  )
}

export default EmptyNotes
