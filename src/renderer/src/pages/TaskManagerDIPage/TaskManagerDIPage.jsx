import { Button, Col, Form, Input, message, Row, Select } from 'antd'
import _ from 'lodash'
import { useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import { taskManagerDIFactroy } from './TaskManagerDIPage.repo'
import withNotification from '../../hoc/withNotification'

const { taskManagerDIRepo } = taskManagerDIFactroy()

const TaskManagerDIWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [folderPath, setFolderPath] = useState('')
  const [domains, setDomains] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const logRef = useRef(null)

  const onFinish = async (values) => {
    try {
      await taskManagerDIRepo.generateCode({ targetDir: folderPath, values })
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const handleSelectFolder = async () => {
    try {
      const path = await taskManagerDIRepo.chooseLocation()
      if (path) {
        setFolderPath(path)
        const domains = await taskManagerDIRepo.getExistingDomainFolders(path)
        setDomains(domains)
      } else {
        renderErrorNotification({
          message: 'No folder selected'
        })
      }
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  return (
    <div>
      <PageHeader
        title="Task Manager DI"
        description="Manage all tools entities including companies, environments, users, and configurations."
      />

      <Button type="dashed" disabled={!_.isEmpty(folderPath)} block onClick={handleSelectFolder}>
        Select Folder
      </Button>
      {folderPath && (
        <div style={{ marginTop: 8, wordBreak: 'break-all', fontSize: 12 }}>
          <b>Selected folder:</b> {folderPath}
        </div>
      )}

      {!_.isEmpty(domains) && (
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="module_name"
            label="List of exisiting modules"
            rules={[
              {
                required: true,
                message: `Please select module`
              }
            ]}
          >
            <Select
              showSearch={true}
              filterOption={(input, option) =>
                (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
              placeholder="Select reason"
              options={domains.map((item) => {
                return {
                  label: item,
                  value: item
                }
              })}
            />
          </Form.Item>
          <Form.Item
            name="task_name"
            label="Enter Task Name"
            rules={[{ required: true, message: 'Please enter Task Name' }]}
          >
            <Input placeholder="Please enter Task Name" />
          </Form.Item>
          <Form.Item
            name="task_description"
            label="Enter Task Description"
            rules={[{ required: true, message: 'Please enter Task Description' }]}
          >
            <Input placeholder="Please enter Task Description" />
          </Form.Item>
          <Row gutter={[16]}>
            <Col xs={12} lg={12}>
              <Form.Item>
                <Button loading={loading} type="primary" htmlType="submit" block disabled={loading}>
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  )
}
const TaskManagerDIPage = withNotification(TaskManagerDIWOC)
export default TaskManagerDIPage
