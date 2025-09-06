import { Button, Form, Input, Modal, Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import EntityTable from './components/EntityTable'
import { useDatabaseData } from './hooks/useDatabaseData'
import { renderSuccessNotification } from '../../../helpers/success.helper'
import { renderErrorNotification } from '../../../helpers/error.helper'
import { RefreshCw } from 'lucide-react'
const { Option } = Select

const GithubReposSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { companies, notificationApi } = useDatabaseData()

  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)

  const loadRepos = async () => {
    setLoading(true)
    try {
      const data = await window.api.githubRepos.getAll()
      setRepos(data || [])
    } catch (error) {
      console.error('Error loading repos:', error)
      renderErrorNotification(
        [
          {
            title: 'Load Failed',
            message: 'Failed to load GitHub repos'
          }
        ],
        notificationApi
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepos()
  }, [])

  const columns = useMemo(
    () => [
      { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
      { title: 'Repository', dataIndex: 'name', key: 'name' }
    ],
    []
  )

  const handleAdd = () => {
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleDelete = async (item) => {
    try {
      await window.api.githubRepos.delete(item.id)
      renderSuccessNotification(
        {
          message: 'Repository deleted successfully!'
        },
        notificationApi
      )
      loadRepos()
    } catch (error) {
      console.error('Error deleting repo:', error)
      renderErrorNotification(
        [
          {
            title: 'Delete Failed',
            message: error.message || 'Failed to delete repository'
          }
        ],
        notificationApi
      )
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      await window.api.githubRepos.add(values.company_id, values.name)
      renderSuccessNotification(
        {
          message: 'Repository added successfully!'
        },
        notificationApi
      )
      setIsModalVisible(false)
      form.resetFields()
      loadRepos()
    } catch (error) {
      console.error('Error saving repo:', error)
      renderErrorNotification(
        [
          {
            title: 'Save Failed',
            message: error.message || 'Failed to save repository'
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

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const [syncCompanyId, setSyncCompanyId] = useState(null)
  const handleSync = async () => {
    if (!syncCompanyId) {
      renderErrorNotification(
        [
          {
            title: 'Validation',
            message: 'Please select a company to sync'
          }
        ],
        notificationApi
      )
      return
    }
    try {
      setLoading(true)
      await window.api.githubRepos.sync(syncCompanyId)
      renderSuccessNotification(
        {
          message: 'Sync completed successfully'
        },
        notificationApi
      )
      loadRepos()
    } catch (error) {
      console.error('Error syncing repos:', error)
      renderErrorNotification(
        [
          {
            title: 'Sync Failed',
            message: error.message || 'Failed to sync repositories'
          }
        ],
        notificationApi
      )
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
          {companies.map((company) => (
            <Option key={company.id} value={company.id}>
              {company.name}
            </Option>
          ))}
        </Select>
        <Button icon={<RefreshCw size={14} />} onClick={handleSync} loading={loading}>
          Sync Repos
        </Button>
      </div>

      <EntityTable
        data={repos}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={null}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No repositories found. Click 'Add New' or run Sync."
      />

      <Modal
        title={'Add New Repository'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
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
            name="name"
            label="Repository Name"
            rules={[{ required: true, message: 'Please enter repository name' }]}
          >
            <Input placeholder="repository-name" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default GithubReposSettings


