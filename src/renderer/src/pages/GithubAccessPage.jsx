import { Button, Form, Modal, Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader/PageHeader'
import EntityTable from './SettingsPage/_blocks/components/EntityTable'
import { useNotification } from '../context/notificationContext'
import { renderErrorNotification } from '../helpers/error.helper'
import { renderSuccessNotification } from '../helpers/success.helper'
const { Option } = Select

const GithubAccessPage = () => {
  const notificationApi = useNotification()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [repos, setRepos] = useState([])
  const [access, setAccess] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [c, u, r, a] = await Promise.all([
        window.api.companies.getAll(),
        window.api.githubUsers.getAll(),
        window.api.githubRepos.getAll(),
        window.api.githubRepoAccess.getAll()
      ])
      setCompanies(c || [])
      setUsers(u || [])
      setRepos(r || [])
      setAccess(a || [])
    } catch (error) {
      console.error('Error loading data:', error)
      renderErrorNotification(
        [
          {
            title: 'Load Failed',
            message: 'Failed to load data'
          }
        ],
        notificationApi
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const columns = useMemo(
    () => [
      { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
      { title: 'Repository', dataIndex: 'repo_name', key: 'repo_name' },
      { title: 'User', dataIndex: 'user_name', key: 'user_name' },
      { title: 'GitHub Handle', dataIndex: 'github_handle', key: 'github_handle' }
    ],
    []
  )

  const handleAdd = () => {
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleDelete = async (item) => {
    try {
      await window.api.githubRepoAccess.delete(item.id)
      renderSuccessNotification({ message: 'Access removed' }, notificationApi)
      loadData()
    } catch (error) {
      console.error('Delete access failed:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to remove access'
          }
        ],
        notificationApi
      )
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      await window.api.githubRepoAccess.add(values.company_id, values.repo_id, values.user_id)
      renderSuccessNotification({ message: 'Access granted' }, notificationApi)
      setIsModalVisible(false)
      form.resetFields()
      loadData()
    } catch (error) {
      console.error('Save access failed:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to grant access'
          }
        ],
        notificationApi
      )
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleSearchChange = (e) => setSearchText(e.target.value)

  // Filter repos by selected company in form
  const selectedCompanyId = Form.useWatch('company_id', form)
  const filteredRepos = useMemo(
    () => repos.filter((r) => r.company_id === selectedCompanyId),
    [repos, selectedCompanyId]
  )

  return (
    <div>
      <PageHeader title="GitHub Access" description="Grant users access to company repos." />

      <EntityTable
        data={access}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={null}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No access records found. Click 'Add New' to grant access."
      />

      <Modal
        title={'Grant Access'}
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Form onFinish={handleSave} form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="company_id"
            label="Company"
            rules={[{ required: true, message: 'Please select company' }]}
          >
            <Select placeholder="Select company">
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="repo_id"
            label="Repository"
            rules={[{ required: true, message: 'Please select repository' }]}
          >
            <Select placeholder="Select repository" disabled={!selectedCompanyId}>
              {filteredRepos.map((repo) => (
                <Option key={repo.id} value={repo.id}>
                  {repo.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="user_id"
            label="User"
            rules={[{ required: true, message: 'Please select user' }]}
          >
            <Select placeholder="Select user">
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} (@{user.github_handle})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default GithubAccessPage
