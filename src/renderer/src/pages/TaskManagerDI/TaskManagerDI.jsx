import { Button, Col, Form, message, Row, Select } from 'antd'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useRef, useState } from 'react'

const ITEMS = ['PRODUCT', 'CATEGORY', 'BRAND']

const TaskManagerDI = () => {
  const [folderPath, setFolderPath] = useState('')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const logRef = useRef(null)

  const onFinish = async (values) => {
    if (!folderPath) {
      message.error('Please select a folder first.')
      return
    }
    setLogs([])
    setLoading(true)
    const bucket_name = 'kpn-brand-upload-bucket-staging/images'
    const command = `gsutil -m cp -r "${folderPath}"/* gs://${bucket_name}`
    setLogs((prev) => [...prev, `#1 ---> Uploading files to "${bucket_name}" bucket`])
    window.api.runShellCommandStream(
      command,
      (log) => {
        setLogs((prev) => [...prev, log])
        // Auto-scroll to bottom
        setTimeout(() => {
          if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
        }, 0)
      },
      (code) => {
        setLoading(false)
        if (code === 0) {
          message.success('Upload complete!')
        } else {
          message.error('Upload failed (exit code ' + code + ')')
        }
      }
    )
  }

  const handleSelectFolder = async () => {
    if (!window.api || !window.api.selectFolder) {
      message.error('Folder selection is not available. window.api is undefined.')
      return
    }
    const path = await window.api.selectFolder()
    if (path) {
      setFolderPath(path)
    } else {
      message.warning('No folder selected')
    }
  }

  return (
    <div>
      <PageHeader
        title="Task Manager DI"
        description="Manage all tools entities including companies, environments, users, and configurations."
      />
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="cancelReason"
          label="Choose a item"
          rules={[
            {
              required: true,
              message: `Please select cancellation reason`
            }
          ]}
        >
          <Select
            style={{ width: '100%' }}
            placeholder="Select reason"
            options={ITEMS.map((item) => {
              return {
                label: item,
                value: item
              }
            })}
          />
        </Form.Item>
        <Row gutter={[16]}>
          <Col xs={12} lg={12}>
            <Form.Item>
              <Button type="dashed" block onClick={handleSelectFolder}>
                Select Folder
              </Button>
              {folderPath && (
                <div style={{ marginTop: 8, wordBreak: 'break-all', fontSize: 12 }}>
                  <b>Selected folder:</b> {folderPath}
                </div>
              )}
            </Form.Item>
          </Col>
          <Col xs={12} lg={12}>
            <Form.Item>
              <Button loading={loading} type="primary" htmlType="submit" block disabled={loading}>
                Upload
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default TaskManagerDI
