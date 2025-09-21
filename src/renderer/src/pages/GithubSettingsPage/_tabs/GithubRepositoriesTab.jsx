import { Button, Form, Input, Modal, Select } from 'antd'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import withNotification from '../../../hoc/withNotification'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
const { Option } = Select

const { githubRepositoriesRepo } = githubSettingsPageFactory()
const { companyRepo } = settingsFactory()

const columns = [
  { title: 'Company', dataIndex: 'company_code', key: 'company_code' },
  { title: 'Repository', dataIndex: 'repo_name', key: 'repo_  name' }
]

const GithubRepositoriesTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const [datasource, setDatasource] = useState({
    companies: [],
    repos: []
  })

  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [repos, allCompanies] = await Promise.all([
        githubRepositoriesRepo.getAll(),
        companyRepo.getAll()
      ])

      setDatasource({
        repos,
        companies: allCompanies
      })
    } catch (error) {
      renderErrorNotification(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = () => {
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleDelete = async (item) => {
    try {
      await githubRepositoriesRepo.delete(item.id)
      renderSuccessNotification({
        message: 'Repository deleted successfully!'
      })
      fetchData()
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const onFinish = async (values) => {
    try {
      await githubRepositoriesRepo.upsert(values)
      renderSuccessNotification({
        message: 'Repository added successfully!'
      })
      setIsModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      console.error('Error saving repo:', error)
      renderErrorNotification({
        message: error.message
      })
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const [syncCompanyId, setSyncCompanyId] = useState(null)

  const handleSync = async () => {
    if (!syncCompanyId) {
      renderErrorNotification({
        title: 'Validation',
        message: 'Please select a company to sync'
      })
      return
    }
    try {
      setLoading(true)
      await githubRepositoriesRepo.sync(syncCompanyId)
      renderSuccessNotification({
        message: 'Sync completed successfully'
      })
      fetchData()
    } catch (error) {
      console.error('Error syncing repos:', error)
      renderErrorNotification({
        title: 'Sync Failed',
        message: error.message || 'Failed to sync repositories'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="Select company to sync"
          style={{ width: 300 }}
          value={syncCompanyId}
          onChange={setSyncCompanyId}
        >
          {datasource.companies.map((company) => (
            <Option key={company.company_code} value={company.company_code}>
              {company.company_code}
            </Option>
          ))}
        </Select>
        <Button icon={<RefreshCw size={14} />} onClick={handleSync} loading={loading}>
          Sync Repos
        </Button>
      </div>

      <EntityTable
        data={datasource.repos}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={null}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No repositories found. Click 'Add New' or run Sync."
      />

      {isModalVisible && (
        <Modal
          title={'Add New Repository'}
          open={true}
          onCancel={handleCancel}
          okText="Save"
          cancelText="Cancel"
          width={600}
          footer={null}
        >
          <Form onFinish={onFinish} form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="company_code"
              label="Company"
              rules={[{ required: true, message: 'Please select company' }]}
            >
              <Select placeholder="Select company">
                {datasource.companies.map((company) => (
                  <Option key={company.company_code} value={company.company_code}>
                    {company.company_code}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="repo_name"
              label="Repository Name"
              rules={[{ required: true, message: 'Please enter repository name' }]}
            >
              <Input placeholder="repository-name" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  )
}

const GithubRepositoriesTab = withNotification(GithubRepositoriesTabWOC)
export default GithubRepositoriesTab
