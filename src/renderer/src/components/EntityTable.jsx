/* eslint-disable react/prop-types */
import { Button, Col, Input, Row, Space, Table } from 'antd'
import { Edit, Plus, Trash, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Popconfirm } from 'antd'

const EntityTable = ({
  rowKey,
  data,
  columns,
  loading,
  onAdd,
  onEdit,
  onDelete,
  searchText,
  onSearchChange,
  extraActions = null,
  emptyText = 'No items found. Click "Add New" to get started.'
}) => {
  const [filteredData, setFilteredData] = useState(data)

  // Update filtered data when data or search changes
  useEffect(() => {
    if (searchText.trim()) {
      const filtered = data.filter((item) => {
        return Object.values(item).some(
          (value) => value && value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      })
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  }, [data, searchText])

  const tableColumns = [
    ...columns,
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          {extraActions &&
            extraActions.map(({ text, onClick, icon }) => {
              const IconCompnent = icon
              return (
                <Button
                  key={text}
                  type="primary"
                  size="small"
                  icon={<IconCompnent size={14} />}
                  onClick={() => onClick(record)}
                >
                  {text}
                </Button>
              )
            })}
          <Button
            type="primary"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => onDelete(record)}
          >
            <Button danger size="small" icon={<Trash size={14} />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="Search..."
            prefix={<Search size={14} />}
            value={searchText}
            onChange={onSearchChange}
            allowClear
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <Button type="primary" icon={<Plus size={16} />} onClick={onAdd}>
            Add New
          </Button>
        </Col>
      </Row>

      <Table
        columns={tableColumns}
        dataSource={filteredData}
        rowKey={rowKey}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        locale={{
          emptyText: searchText ? `No items found matching "${searchText}"` : emptyText
        }}
      />
    </>
  )
}

export default EntityTable
