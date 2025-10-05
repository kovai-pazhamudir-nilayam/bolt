/* eslint-disable react/prop-types */

import { Col, Form, Row } from 'antd'
import PageHeader from '../../components/PageHeader/PageHeader'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import { useEffect, useRef, useState } from 'react'
import SelectFormItem from '../../components/SelectFormItem'
import withNotification from '../../hoc/withNotification'
import SubmitBtnForm from '../../components/SubmitBtnForm'
import { settingsFactory } from '../../repos/settingsPage.repo'
import { terminalFactory } from '../../repos/terminal.repo'
const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()
const { terminalRepo } = terminalFactory()

const ConnectRedisPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const logRef = useRef(null)
  const onFinish = async (values) => {
    let redisConfigObj
    try {
      redisConfigObj = await gcpProjectConfigRepo.getOne({
        company_code: values.company_code,
        env_code: values.env_code
      })
    } catch (error) {
      renderErrorNotification({
        message: error.message || 'Failed to fetch Redis config'
      })
      return
    }

    if (!redisConfigObj?.redis_host || !redisConfigObj?.redis_password) {
      renderErrorNotification({
        message: 'Redis config does not exist'
      })
      return
    } else {
      const command1 = `gcloud container clusters get-credentials ${cluster} --region ${region} --project ${project}`
      console.log('No Redis Config Found')
    }
  }

  const [datasource, setDatasource] = useState({
    companies: [],
    environments: []
  })

  async function fetchData() {
    setLoading(true)
    try {
      const [allCompanies, allEnvironments] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])

      setDatasource({
        companies: allCompanies,
        environments: allEnvironments
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
    <div>
      <PageHeader
        title="Connect to Redis"
        description="Process media files from a selected folder and upload them to a Google Cloud Storage bucket."
      />
      <Row gutter={[16, 16]}>
        <Col lg={10} xs={24}>
          <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
            <SelectFormItem
              options={datasource.companies}
              name="company_code"
              label="Company"
              transform={'COMPANIES'}
            />
            <SelectFormItem
              options={datasource.environments}
              name="env_code"
              label="Environment"
              transform={'ENVIRONMENTS'}
            />
            <SubmitBtnForm loading={loading} />
          </Form>
        </Col>
        <Col lg={14} xs={24}>
          <LogsViewer logRef={logRef} logs={logs} />
        </Col>
      </Row>
    </div>
  )
}

const ConnectRedisPage = withNotification(ConnectRedisPageWoc)

export default ConnectRedisPage
