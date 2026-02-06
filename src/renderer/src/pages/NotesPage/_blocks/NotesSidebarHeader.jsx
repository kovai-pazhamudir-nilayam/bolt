import { Button, Input, Select, Space, Typography } from 'antd'
import { Plus, Search } from 'lucide-react'

const { Title } = Typography

const NotesSidebarHeader = ({
  searchText,
  onSearchChange,
  onCreateNew,
  companies,
  selectedCompanyFilter,
  onCompanyFilterChange
}) => {
  return (
    <div className="header">
      <div className="title-container">
        <Title level={3} className="title">
          My Notes
        </Title>
        <Button
          type="primary"
          shape="circle"
          icon={<Plus size={18} />}
          onClick={onCreateNew}
          className="create-btn"
        />
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Input
          placeholder="Search notes..."
          prefix={<Search size={16} style={{ color: 'var(--ev-c-text-3)' }} />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          allowClear
        />

        <Select
          style={{ width: '100%' }}
          placeholder="Filter by company"
          value={selectedCompanyFilter}
          onChange={onCompanyFilterChange}
          options={[
            { label: 'All Companies', value: null },
            ...companies.map((c) => ({
              label: `${c.company_code} - ${c.company_name}`,
              value: c.company_code
            }))
          ]}
          className="company-filter-select"
          allowClear
        />
      </Space>
    </div>
  )
}

export default NotesSidebarHeader
