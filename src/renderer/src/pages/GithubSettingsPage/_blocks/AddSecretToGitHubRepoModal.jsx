import { Button, Checkbox, Col, Divider, Form, Modal, Row, Space } from 'antd'

import InputFormItem from '../../../components/InputFormItem'

const getGroupedSecret = (data) => {
  return data.reduce((acc, item) => {
    const key = item.company_code
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

const getSecretKey = (secret) =>
  JSON.stringify({ secret_name: secret.secret_name, secret_value: secret.secret_value })

const SecretSelectionGroup = ({ value = [], onChange, datasource }) => {
  const groupedSecrets = getGroupedSecret(datasource.secrets)
  const companyMap = datasource.companies.reduce((acc, c) => ({ ...acc, [c.value]: c.label }), {})

  const allSecretsFlattened = Object.values(groupedSecrets)
    .flat()
    .map((s) => getSecretKey(s))

  const handleSelectAllGlobal = (e) => {
    onChange(e.target.checked ? allSecretsFlattened : [])
  }

  const handleSelectAllCompany = (companyCode, secretsInCompany, checked) => {
    const companySecretKeys = secretsInCompany.map((s) => getSecretKey(s))
    let newSelected = [...value]

    if (checked) {
      // Add missing ones
      companySecretKeys.forEach((key) => {
        if (!newSelected.includes(key)) {
          newSelected.push(key)
        }
      })
    } else {
      // Remove all belonging to this company
      newSelected = newSelected.filter((key) => !companySecretKeys.includes(key))
    }
    onChange(newSelected)
  }

  const handleToggleSecret = (key, checked) => {
    let newSelected = [...value]
    if (checked) {
      if (!newSelected.includes(key)) newSelected.push(key)
    } else {
      newSelected = newSelected.filter((k) => k !== key)
    }
    onChange(newSelected)
  }

  // Calculate Checkbox states
  const isAllSelected =
    allSecretsFlattened.length > 0 && value.length === allSecretsFlattened.length
  const isIndeterminate = value.length > 0 && value.length < allSecretsFlattened.length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <div style={{ padding: '4px 12px', background: '#f5f5f5', borderRadius: 8 }}>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={handleSelectAllGlobal}
          >
            <h3>All Secrets</h3>
          </Checkbox>
        </div>
      </div>

      {Object.entries(groupedSecrets).map(([companyCode, secrets]) => {
        const companyName = companyMap[companyCode] || companyCode
        const companyKeys = secrets.map((s) => getSecretKey(s))

        const selectedCount = companyKeys.filter((key) => value.includes(key)).length
        const allCompanySelected = selectedCount === secrets.length
        const companyIndeterminate = selectedCount > 0 && selectedCount < secrets.length

        return (
          <div key={companyCode} style={{ marginBottom: 24 }}>
            <Divider orientationMargin="0" orientation="left" style={{ margin: '12px 0' }}>
              <Space>
                <Checkbox
                  indeterminate={companyIndeterminate}
                  checked={allCompanySelected}
                  onChange={(e) => handleSelectAllCompany(companyCode, secrets, e.target.checked)}
                />
                <h3>
                  <u>{companyName} Secrets</u>
                </h3>
              </Space>
            </Divider>
            <Row gutter={[16, 16]}>
              {secrets.map((secret) => {
                const key = getSecretKey(secret)
                return (
                  <Col span={12} key={secret.secret_name}>
                    <Checkbox
                      checked={value.includes(key)}
                      onChange={(e) => handleToggleSecret(key, e.target.checked)}
                    >
                      {secret.secret_name}
                    </Checkbox>
                  </Col>
                )
              })}
            </Row>
          </div>
        )
      })}
    </div>
  )
}

const AddSecretToGitHubRepoModal = ({ values, onCancel, datasource, onFinish }) => {
  const { repo_name } = values
  const [form] = Form.useForm()

  const handleFinish = (formValues) => {
    // Parse the secrets strings back to objects
    const parsedSecrets = formValues.secrets.map((s) => JSON.parse(s))
    onFinish({ ...values, ...formValues, secrets: parsedSecrets })
  }

  return (
    <Modal
      title={`Add Secrets to Github - ${repo_name} Repo`}
      open={true}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form
        initialValues={{ ...values, secrets: [] }}
        onFinish={handleFinish}
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <InputFormItem disabled={true} name="repo_name" label="Repository Name" />

        <Form.Item
          name="secrets"
          rules={[{ required: true, message: 'Please choose at least one secret' }]}
        >
          <SecretSelectionGroup datasource={datasource} />
        </Form.Item>

        <Form.Item>
          <SpaceStyled>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </SpaceStyled>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const SpaceStyled = ({ children }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{children}</div>
)

export default AddSecretToGitHubRepoModal
