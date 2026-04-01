import { Button, Col, Form, Input, Row } from 'antd'
import { DatabaseZap } from 'lucide-react'
import { useEffect, useState } from 'react'
import CompanySelection from '../../components/CompanySelection'
import DBSelection from '../../components/DBSelection'
import EnvironmentSelection from '../../components/EnvironmentSelection'
import PageHeader from '../../components/PageHeader/PageHeader'
import { getJumpboxPod } from '../../helpers/jumpbox.helper'
import withNotification from '../../hoc/withNotification'
import { dbSecretsFactory } from '../../repos/DBSecretsPage.repo'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { shellFactory } from '../../repos/shell.repo'
import { systemFactory } from '../../repos/system.repo'

const DBDumpPageWOC = ({ renderSuccessNotification, renderErrorNotification }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [allDbSecrets, setAllDbSecrets] = useState([])

  const { gcpProjectConfigRepo } = settingsFactory()
  const { dbSecretsRepo } = dbSecretsFactory()
  const { shellRepo } = shellFactory()
  const { systemRepo } = systemFactory()

  useEffect(() => {
    dbSecretsRepo.getAll().then(setAllDbSecrets)
  }, [])

  const onFinish = async (values) => {
    const { company_code, env_code, db_name, query } = values

    setLoading(true)

    const dbSecret = allDbSecrets.find(
      (s) => s.company_code === company_code && s.db_name === db_name && s.environment === env_code
    )
    if (!dbSecret) {
      renderErrorNotification({
        message: `No DB secret found for ${db_name} in the selected environment.`
      })
      setLoading(false)
      return
    }

    const gcpConfig = await gcpProjectConfigRepo.getOne({ company_code, env_code })
    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = gcpConfig || {}
    if (!cluster || !region || !project) {
      renderErrorNotification({
        message: 'Missing GCP configuration (cluster, region, or project).'
      })
      setLoading(false)
      return
    }

    const gcloudResult = await shellRepo.run(
      `gcloud container clusters get-credentials ${cluster} --region ${region} --project ${project}`
    )
    if (gcloudResult.code !== 0) {
      renderErrorNotification({ message: 'Failed to get GCP credentials.' })
      setLoading(false)
      return
    }

    const jumpboxPod = await getJumpboxPod().catch((err) => {
      renderErrorNotification({ message: err.message })
      return null
    })
    if (!jumpboxPod) {
      setLoading(false)
      return
    }

    const { db_host: host, db_user: user, db_password: password, db_name: dbName } = dbSecret
    const escapedPassword = password.replace(/'/g, "'\\''")
    const escapedQuery = query.replace(/'/g, "'\\''")
    const tempPath = `/tmp/bolt_dump_${Date.now()}.csv`
    const psqlCmd = `PGPASSWORD='${escapedPassword}' psql -h ${host} -U ${user} ${dbName} -q -c '\\COPY (${escapedQuery}) TO STDOUT WITH CSV HEADER'`
    const command = `kubectl exec ${jumpboxPod} -- sh -c "${psqlCmd.replace(/"/g, '\\"')}" > "${tempPath}"`

    const result = await shellRepo.run(command)

    if (result.code !== 0) {
      renderErrorNotification({ message: `Dump failed (exit code ${result.code})` })
      await shellRepo.run(`rm -f "${tempPath}"`)
      setLoading(false)
      return
    }

    const savePath = await systemRepo.saveFileDialog(`dump_${db_name}.csv`)
    if (!savePath) {
      await shellRepo.run(`rm -f "${tempPath}"`)
      setLoading(false)
      return
    }

    await shellRepo.run(`mv "${tempPath}" "${savePath}"`)
    renderSuccessNotification({ message: `Dump saved to ${savePath}` })
    setLoading(false)
  }

  return (
    <div style={{ padding: '0 24px' }}>
      <PageHeader title="DB Dump" description="Export a SQL query result directly to a CSV file" />
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
        <Row gutter={[16, 0]}>
          <Col span={8}>
            <CompanySelection />
          </Col>
          <Col span={8}>
            <EnvironmentSelection />
          </Col>
          <Col span={8}>
            <DBSelection />
          </Col>
        </Row>
        <Form.Item name="query" label="SQL Query" rules={[{ required: true }]}>
          <Input.TextArea rows={6} placeholder="SELECT * FROM your_table WHERE ..." />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<DatabaseZap size={16} />}
          >
            Dump to CSV
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

const DBDumpPage = withNotification(DBDumpPageWOC)

export default DBDumpPage
