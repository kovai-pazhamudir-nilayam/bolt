import { Button, Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'

const { companyRepo } = settingsFactory()

const CompanyModal = ({ editing, handleCancel, onFinish, form }) => {
  return (
    <Modal
      title={editing ? 'Edit Company' : 'Add New Company'}
      open={true}
      footer={null}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
        <Form.Item
          name="company_code"
          label="Company Code"
          rules={[{ required: true, message: 'Please enter company code' }]}
        >
          <Input disabled={editing} placeholder="e.g., KPN, IBO" />
        </Form.Item>
        <Form.Item
          name="company_name"
          label="Company Name"
          rules={[{ required: true, message: 'Please enter company name' }]}
        >
          <Input placeholder="e.g., Kovai Pazhamudir Nilayam" />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: 'Logo URL is required'
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const regex = /\.(png|jpe?g|gif|svg|webp)$/i
                try {
                  new URL(value)
                } catch {
                  return Promise.reject('Invalid URL format')
                }
                if (!regex.test(value)) {
                  return Promise.reject('Logo must be a valid image URL')
                }
                return Promise.resolve()
              }
            }
          ]}
          name="company_logo"
          label="Logo URL"
        >
          <Input placeholder="Optional logo URL" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const columns = [
  { title: 'Code', dataIndex: 'company_code', key: 'company_code' },
  { title: 'Name', dataIndex: 'company_name', key: 'company_name' },
  {
    title: 'Logo',
    dataIndex: 'company_logo',
    key: 'company_logo',
    render: (text) => text || 'No logo'
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text) => new Date(text).toLocaleDateString()
  },
  {
    title: 'Updated',
    dataIndex: 'updated_at',
    key: 'updated_at',
    render: (text) => new Date(text).toLocaleDateString()
  }
]

const CompanySettingsTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const loadData = async () => {
    const data = await companyRepo.getAll()
    setCompanies(data)
  }

  useEffect(() => {
    setLoading(true)
    loadData()
    setLoading(false)
  }, [])

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const handleEdit = (item) => {
    setEditing(item)
    form.setFieldsValue(item)
    setOpen(true)
  }

  const handleDelete = async (item) => {
    try {
      await companyRepo.delete(item.company_code)
      loadData()
      renderSuccessNotification({
        message: 'Company deleted successfully!'
      })
      // loadAllData()
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
    setEditing(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const onFinish = async (values) => {
    try {
      await companyRepo.upsert(values)
      setOpen(false)
      setEditing(null)
      form.resetFields()
      loadData()
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  return (
    <>
      <EntityTable
        rowKey="company_code"
        data={companies}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No companies found. Click 'Add New' to get started."
      />

      {open && (
        <CompanyModal
          editing={editing}
          handleCancel={handleCancel}
          onFinish={onFinish}
          form={form}
        />
      )}
    </>
  )
}

const CompanySettingsTab = withNotification(CompanySettingsTabWOC)

export default CompanySettingsTab
