/* eslint-disable react/prop-types */
import { Col, Form, Row, Space } from 'antd'
import { ShieldPlus, SquareAsterisk } from 'lucide-react'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import SelectFormItem from '../../../components/SelectFormItem'
import SubmitBtnForm from '../../../components/SubmitBtnForm'
import withNotification from '../../../hoc/withNotification'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import AddNewGithubRepoModal from '../_blocks/AddNewGithubRepoModal'
import AddSecretToGitHubRepoModal from '../_blocks/AddSecretToGitHubRepoModal'
import GitHubRepoAccessModal from '../_blocks/GitHubRepoAccessModal'

const { githubRepositoriesRepo, githubUsersRepo, githubSecretRepo } = githubSettingsPageFactory()
const { companyRepo } = settingsFactory()

const columns = [
  {
    title: 'Company',
    dataIndex: 'company_code',
    key: 'company_code',
    onFilter: (value, record) => record.address.startsWith(value),
    filterSearch: true,
    filters: [
      {
        text: 'London',
        value: 'London'
      },
      {
        text: 'New York',
        value: 'New York'
      }
    ]
  },
  {
    title: 'Repository',
    dataIndex: 'repo_name',
    key: 'repo_name',
    onFilter: (value, record) => record.address.startsWith(value),
    filterSearch: true
  }
]

const GithubRepositoriesTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [repoForAccess, setRepoForAccess] = useState(null)
  const [repoForSecret, setRepoForSecret] = useState(null)
  const [searchText, setSearchText] = useState('')

  const [datasource, setDatasource] = useState({
    companies: [],
    repos: [],
    users: [],
    secrets: []
  })

  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [allRepos, allCompanies, allGithubUsers, allGithubSecrets] = await Promise.all([
        githubRepositoriesRepo.getAll(),
        companyRepo.getAll(),
        githubUsersRepo.getAll(),
        githubSecretRepo.getAll()
      ])

      setDatasource({
        repos: allRepos,
        companies: allCompanies,
        users: allGithubUsers,
        secrets: allGithubSecrets
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
    setIsModalVisible(true)
  }

  const handleDelete = async (item) => {
    try {
      await githubRepositoriesRepo.delete(item)
      renderSuccessNotification({
        message: 'Repository deleted successfully!'
      })
      fetchData()
    } catch (error) {
      renderErrorNotification({
        message: error.message || 'Failed to delete repository'
      })
    }
  }

  const onFinish = async (values) => {
    try {
      await githubRepositoriesRepo.upsert(values)
      renderSuccessNotification({
        message: 'Repository added successfully!'
      })
      setIsModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Error saving repo:', error)
      renderErrorNotification({
        message: error.message
      })
    }
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const handleSync = async (values) => {
    const { syncCompanyId } = values

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

  const handleGithubSecret = async (values) => {
    try {
      setLoading(true)
      const { success, message } = await githubRepositoriesRepo.secret(values)
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
        message: error.message || 'Failed to add secret to repository'
      })
    } finally {
      setRepoForSecret(null)
      setLoading(false)
    }
  }

  const onAddSecretClick = (value) => {
    setRepoForSecret(value)
  }

  return (
    <>
      <Space direction="vertical" style={{ marginBottom: '16px', display: 'flex', width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form onFinish={handleSync} layout="inline" requiredMark={false}>
              <SelectFormItem
                options={datasource.companies}
                name="syncCompanyId"
                label=""
                transform="COMPANIES"
              />
              <SubmitBtnForm loading={loading} btnText="Sync Repos" />
            </Form>
          </Col>
        </Row>
        <EntityTable
          data={datasource.repos}
          columns={columns}
          loading={loading}
          extraActions={[
            {
              text: 'Access',
              onClick: onAccessClick,
              icon: ShieldPlus
            },
            {
              text: 'Add Secret',
              onClick: onAddSecretClick,
              icon: SquareAsterisk
            }
          ]}
          onAdd={handleAdd}
          onEdit={null}
          onDelete={handleDelete}
          searchText={searchText}
          onSearchChange={handleSearchChange}
          emptyText="No repositories found. Click 'Add New' or run Sync."
        />
      </Space>

      {isModalVisible && (
        <AddNewGithubRepoModal
          handleCancel={() => setIsModalVisible(false)}
          datasource={datasource}
          onFinish={onFinish}
        />
      )}

      {repoForAccess && (
        <GitHubRepoAccessModal
          values={repoForAccess}
          datasource={datasource}
          onCancel={() => setRepoForAccess(null)}
          onFinish={handleGithubAccess}
        />
      )}

      {repoForSecret && (
        <AddSecretToGitHubRepoModal
          values={repoForSecret}
          datasource={datasource}
          onCancel={() => setRepoForSecret(null)}
          onFinish={handleGithubSecret}
        />
      )}
    </>
  )
}

const GithubRepositoriesTab = withNotification(GithubRepositoriesTabWOC)
export default GithubRepositoriesTab
