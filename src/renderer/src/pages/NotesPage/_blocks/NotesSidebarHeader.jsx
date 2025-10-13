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
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="title-container">
          <Title level={3} className="title">
            Notes
          </Title>
          <div className="title-actions">
            <Select
              style={{ width: '100px' }}
              placeholder="Filter by company..."
              value={selectedCompanyFilter}
              onChange={onCompanyFilterChange}
              options={[
                { label: 'All', value: null },
                ...companies.map((c) => ({
                  label: `${c.company_code}`,
                  value: c.company_code
                }))
              ]}
              className="company-filter-select"
              allowClear
              size="small"
            />
            <Button type="primary" icon={<Plus size={16} />} onClick={onCreateNew} size="small" />
          </div>
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
