import { Typography } from 'antd'

const { Text, Title } = Typography
const EmptyNotes = () => {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <Title level={3} className="empty-title">
          No Note Selected
        </Title>
        <Text>Select a note from the sidebar to view its content</Text>
      </div>
    </div>
  )
}

export default EmptyNotes
