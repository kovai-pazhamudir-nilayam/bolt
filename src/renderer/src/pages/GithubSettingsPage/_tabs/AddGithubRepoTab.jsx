import { Button, Col, Flex, Form, Input, Radio, Row, Select } from 'antd'
import { useEffect, useState } from 'react'
import withNotification from '../../../hoc/withNotification'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import FastifyWhiteIcon from '../../../assets/fastify-white.svg'
import FastifyBlackIcon from '../../../assets/fastify-black.svg'
import NestIcon from '../../../assets/nestjs-logo.svg'
import { githubSettingsPageFactory } from '../../../repos/githubSettingsPage.repo'
const { Option } = Select

const { companyRepo } = settingsFactory()
const { githubConfigsRepo, githubRepositoriesRepo } = githubSettingsPageFactory()

const AddGithubRepoTabWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [datasource, setDatasource] = useState({
    companies: [],
    githubConfigs: []
  })

  const onFinish = async (values) => {
    const { company_code, template_repo_type, repo_name } = values
    const githubConfigForCompany = datasource.githubConfigs.filter(
      (company) => company.company_code === company_code
    )[0]

    if (!githubConfigForCompany) {
      renderErrorNotification({
        message: 'Add Github configuration in GitHub Configs Section'
      })
      return
    }

    const template_repo = githubConfigForCompany[template_repo_type]

    if (!template_repo) {
      renderErrorNotification({
        message: 'Add template repo configuration in GitHub Configs Section'
      })
      return
    }

    const input = {
      company_code,
      template_repo,
      repo_name
    }

    try {
      setLoading(true)
      const { success, message } = await githubRepositoriesRepo.create(input)
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const [allCompanies, allGithubConfigs] = await Promise.all([
        companyRepo.getAll(),
        githubConfigsRepo.getAll()
      ])

      setDatasource({
        companies: allCompanies,
        githubConfigs: allGithubConfigs
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

  return (
    <Row>
      <Col span={12}>
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
            rules={[{ required: true, message: 'Please Enter Repository Name' }]}
          >
            <Input placeholder="Enter Repository Name" />
          </Form.Item>
          <Form.Item
            name="template_repo_type"
            label="Template"
            rules={[{ required: true, message: 'Please Template' }]}
          >
            <Radio.Group
              options={[
                {
                  value: 'fastify_template',
                  label: (
                    <Flex gap="small" justify="center" align="center" vertical>
                      <img src={FastifyBlackIcon} alt="Fastify Template" />
                      Fastify Template
                    </Flex>
                  )
                },
                {
                  value: 'nestjs_template',
                  label: (
                    <Flex gap="small" justify="center" align="center" vertical>
                      <img width={50} src={NestIcon} alt="Nest.JS Template" />
                      Nestjs Template
                    </Flex>
                  )
                }
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button loading={loading} type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

const AddGithubRepoTab = withNotification(AddGithubRepoTabWOC)

export default AddGithubRepoTab
