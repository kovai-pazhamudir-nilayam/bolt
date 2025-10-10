import { Button, Input, Space, Typography } from 'antd'
import { Plus, Search } from 'lucide-react'

const { Title } = Typography

const NotesSidebarHeader = ({ searchText, onSearchChange, onCreateNew }) => {
  return (
    <div className="header">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="title-container">
          <Title level={3} className="title">
            Notes
          </Title>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={onCreateNew}
            size="small"
          >
            New
          </Button>
        </div>

        <Input
          placeholder="Search notes..."
          prefix={<Search size={14} />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </Space>
    </div>
  )
}

export default NotesSidebarHeader
