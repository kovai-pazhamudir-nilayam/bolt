import { Button, Typography } from 'antd'
import { Plus, Notebook } from 'lucide-react'

const { Text, Title } = Typography

const EmptyNotes = ({ onCreateNew }) => {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <div className="empty-illustration">
          <Notebook size={64} strokeWidth={1} />
        </div>
        <Title level={4} className="empty-title">
          No note selected
        </Title>
        <Text className="empty-description">
          Pick a note from the sidebar or create a new one.
        </Text>
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={onCreateNew}
          style={{ marginTop: 16 }}
        >
          New Note
        </Button>
      </div>
    </div>
  )
}

export default EmptyNotes
