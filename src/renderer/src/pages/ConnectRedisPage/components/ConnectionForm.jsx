import { Form, Space, Button, Badge } from 'antd'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import SelectFormItem from '../../../components/SelectFormItem'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import { runShellCommand, getJumpboxPod, runRedisCommand } from '../services/redisService'

const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()

const validateRedisConfig = (config, renderErrorNotification) => {
  if (!config?.redis_host || !config?.redis_password) {
    renderErrorNotification({ message: 'Redis config does not exist' })
    return false
  }
  const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = config
  if (!cluster || !region || !project) {
    renderErrorNotification({
      message: 'Missing required GCP/Redis configuration (cluster, region, or project)'
    })
    return false
  }
  return true
}

const ConnectionForm = ({
  renderErrorNotification,
  renderSuccessNotification,
  connected,
  setConnected,
  setContext,
  setConnectionLabel
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: []
  })

  useEffect(() => {
    const loadSelectionData = async () => {
      const [allCompanies, allEnvironments] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])
      setDatasource({ companies: allCompanies, environments: allEnvironments })
    }
    loadSelectionData()
  }, [])

  const onConnect = async (values) => {
    setLoading(true)
    try {
      const config = await gcpProjectConfigRepo.getOne({
        company_code: values.company_code,
        env_code: values.env_code
      })

      if (!validateRedisConfig(config, renderErrorNotification)) {
        setLoading(false)
        return
      }

      const gcloudCmd = `gcloud container clusters get-credentials ${config.gcp_cluster} --region ${config.gcp_region} --project ${config.gcp_project}`
      await runShellCommand(gcloudCmd, 'GCP Auth')

      const pod = await getJumpboxPod()
      setContext({ pod, config })
      setConnected(true)
      const company = datasource.companies.find((c) => c.company_code === values.company_code)
      const env = datasource.environments.find((e) => e.env_code === values.env_code)
      if (setConnectionLabel) {
        setConnectionLabel(`${company?.name || values.company_code} · ${env?.name || values.env_code}`)
      }
      renderSuccessNotification({ message: `Connected to jumpbox: ${pod}` })

      // Initial ping check
      const newCtx = { pod, config }
      const ping = await runRedisCommand('ping', newCtx)
      if (ping && ping.includes('PONG')) {
        renderSuccessNotification({ message: 'Redis connection successful' })
      }
    } catch (error) {
      renderErrorNotification({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} onFinish={onConnect} layout="inline" style={{ marginBottom: 24 }}>
      <Space align="center">
        <SelectFormItem
          options={datasource.companies}
          name="company_code"
          label="Company"
          transform="COMPANIES"
          style={{ width: 200 }}
        />
        <SelectFormItem
          options={datasource.environments}
          name="env_code"
          label="Environment"
          transform="ENVIRONMENTS"
          style={{ width: 150 }}
        />
        <Button type="primary" htmlType="submit" loading={loading} icon={<RefreshCw size={16} />}>
          {connected ? 'Reconnect' : 'Connect'}
        </Button>
        {connected ? (
          <Badge status="success" text={<span style={{ fontSize: 12 }}><Wifi size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Connected</span>} />
        ) : (
          <Badge status="default" text={<span style={{ fontSize: 12 }}><WifiOff size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Not connected</span>} />
        )}
      </Space>
    </Form>
  )
}

export default ConnectionForm
