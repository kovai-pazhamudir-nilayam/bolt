import { Button, Input, Select, Space, Typography } from 'antd'
import { Plus, Search } from 'lucide-react'

const { Text } = Typography

const NotesSidebarHeader = ({
  searchText,
  onSearchChange,
  onCreateNew,
  companies,
  selectedCompanyFilter,
  onCompanyFilterChange,
  noteCount
}) => {
  return (
    <div className="header">
      <div className="title-row">
        <div className="title-left">
          <Text className="sidebar-title">Notes</Text>
          {noteCount > 0 && <Text className="note-count">{noteCount}</Text>}
        </div>
        <Button
          type="primary"
          size="small"
          icon={<Plus size={14} />}
          onClick={onCreateNew}
          className="create-btn"
        >
          New
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        <Input
          placeholder="Search notes..."
          prefix={<Search size={14} style={{ color: 'var(--ev-c-text-3)' }} />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          allowClear
          size="small"
        />

        {companies.length > 0 && (
          <Select
            style={{ width: '100%' }}
            placeholder="All companies"
            value={selectedCompanyFilter}
            onChange={onCompanyFilterChange}
            options={[
              { label: 'All companies', value: null },
              ...companies.map((c) => ({
                label: `${c.company_code} - ${c.company_name}`,
                value: c.company_code
              }))
            ]}
            allowClear
            size="small"
          />
        )}
      </Space>
    </div>
  )
}

export default NotesSidebarHeader
