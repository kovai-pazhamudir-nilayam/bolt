/* eslint-disable react/prop-types */
import { Button, Form, Input, Modal, Select } from 'antd'
import { RefreshCw, ShieldPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import withNotification from '../../../hoc/withNotification'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
const { Option } = Select

const { githubRepositoriesRepo, githubUsersRepo } = githubSettingsPageFactory()
const { companyRepo } = settingsFactory()

const columns = [
  { title: 'Company', dataIndex: 'company_code', key: 'company_code' },
  { title: 'Repository', dataIndex: 'repo_name', key: 'repo_  name' }
]

const GITHUB_PEMISSIONS = [
  {
    label: 'WRITE',
    value: 'push'
  },
  {
    label: 'READ',
    value: 'pull'
  },
  {
    label: 'ADMIN',
    value: 'admin'
  }
]

const GitHubRepoAccessModal = ({ values, onCancel, datasource, onFinish }) => {
  const { repo_name } = values
  const [form] = Form.useForm()
  return (
    <Modal
      title={`Github Access - ${repo_name} Repo`}
      open={true}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
      width={600}
      footer={null}
    >
      <Form
        initialValues={values}
        onFinish={onFinish}
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="company_code"
          label="Company"
          rules={[{ required: true, message: 'Please select company' }]}
        >
          <Select disabled placeholder="Select company">
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
          <Input disabled placeholder="repository-name" />
        </Form.Item>
        <Form.Item
          name="github_handle"
          label="Github User"
          rules={[{ required: true, message: 'Please select github user' }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.key ?? '').toLowerCase().includes(input.toLowerCase()) ||
              (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Select user"
          >
            {datasource.users.map((user) => (
              <Option key={user.name} value={user.github_handle}>
                {user.name} @{user.github_handle}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="access_level"
          label="Github Permission"
          rules={[{ required: true, message: 'Please select Permission' }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.key ?? '').toLowerCase().includes(input.toLowerCase()) ||
              (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Select Permission"
          >
            {GITHUB_PEMISSIONS.map((permission) => (
              <Option key={permission.label} value={permission.value}>
                {permission.label}
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
  )
}

const GithubRepositoriesTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [repoForAccess, setRepoForAccess] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const [datasource, setDatasource] = useState({
    companies: [],
    repos: [],
    users: []
  })

  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [allRepos, allCompanies, allGithubUsers] = await Promise.all([
        githubRepositoriesRepo.getAll(),
        companyRepo.getAll(),
        githubUsersRepo.getAll()
      ])

      setDatasource({
        repos: allRepos,
        companies: allCompanies,
        users: allGithubUsers
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
    setRepoForAccess(e)
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

  const onAccessClick = (value) => {
    setRepoForAccess(value)
  }

  const handleGithubAccess = async (values) => {
    try {
      setLoading(true)
      const { success, message } = await githubRepositoriesRepo.access(values)
      if (success) {
        renderSuccessNotification({
          message
        })
        fetchData()
      } else {
        renderErrorNotification({
          message
        })
      }
    } catch (error) {
      renderErrorNotification({
        title: 'Access Failed',
        message: error.message || 'Failed to sync repositories'
      })
    } finally {
      setRepoForAccess(null)
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
        extraActions={[
          {
            text: 'Access',
            onClick: onAccessClick,
            icon: ShieldPlus
          }
        ]}
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
      {repoForAccess && (
        <GitHubRepoAccessModal
          values={repoForAccess}
          datasource={datasource}
          onCancel={() => setRepoForAccess(null)}
          onFinish={handleGithubAccess}
        />
      )}
    </>
  )
}

const GithubRepositoriesTab = withNotification(GithubRepositoriesTabWOC)
export default GithubRepositoriesTab
