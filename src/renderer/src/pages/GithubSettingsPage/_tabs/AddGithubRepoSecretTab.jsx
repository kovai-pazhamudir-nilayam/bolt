import { Button, Form, Modal, Typography } from 'antd'
import { useEffect, useState } from 'react'
import EntityTable from '../../../components/EntityTable'
import InputFormItem from '../../../components/InputFormItem'
import SelectFormItem from '../../../components/SelectFormItem'
import withNotification from '../../../hoc/withNotification'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
const { Text } = Typography

const { companyRepo } = settingsFactory()
const { githubSecretRepo } = githubSettingsPageFactory()

const githubSecretsTabColumns = [
  { title: 'Company', dataIndex: 'company_code', key: 'company_code' },
  {
    title: 'Secret Name',
    dataIndex: 'secret_name',
    key: 'secret_name',
    render: (secret_name) => <Text code>{secret_name}</Text>
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

const AddGithubRepoSecretTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const [datasource, setDatasource] = useState({
    companies: [],
    githubSecrets: []
  })

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setIsModalVisible(true)
  }

  async function fetchData() {
    setLoading(true)
    try {
      const [allCompanies, githubSecrets] = await Promise.all([
        companyRepo.getAll(),
        githubSecretRepo.getAll()
      ])

      setDatasource({
        companies: allCompanies,
        githubSecrets: githubSecrets
      })
    } catch (error) {
      renderErrorNotification({
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (item) => {
    try {
      await window.api.githubUsers.delete(item.id)
      renderSuccessNotification({
        message: 'GitHub secret deleted successfully!'
      })
      fetchData()
    } catch (error) {
      renderErrorNotification(error.message)
    }
  }

  const onFinish = async (values) => {
    try {
      await githubSecretRepo.upsert(values)
      renderSuccessNotification({
        message: editingItem
          ? 'GitHub Secret updated successfully!'
          : 'GitHub Secret added successfully!'
      })

      setIsModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      console.error('Error saving GitHub user:', error)
      renderErrorNotification(error)
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingItem(null)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  return (
    <>
      <EntityTable
        data={datasource.githubSecrets}
        columns={githubSecretsTabColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        emptyText="No users found. Click 'Add New' to get started."
      />

      {isModalVisible && (
        <Modal
          title={editingItem ? 'Edit GitHub Secret' : 'Add New GitHub Secret'}
          open={true}
          onCancel={handleCancel}
          okText="Save"
          cancelText="Cancel"
          width={600}
          footer={null}
        >
          <Form onFinish={onFinish} form={form} layout="vertical" requiredMark={false}>
            <SelectFormItem
              disabled={editingItem}
              items={datasource.companies}
              name="company_code"
              label="Company"
            />
            <InputFormItem disabled={editingItem} name="secret_name" label="Secret Name" />
            <InputFormItem isTextArea name="secret_value" label="Secret Value" />
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

const AddGithubRepoSecretTab = withNotification(AddGithubRepoSecretTabWOC)

export default AddGithubRepoSecretTab
