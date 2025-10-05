import { Button, Col, Form, Row, Select, message } from 'antd'
import { useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import { systemFactory } from '../../repos/system.repo'
import withNotification from '../../hoc/withNotification'
const ITEMS = ['PRODUCT', 'CATEGORY', 'BRAND']
const { systemRepo } = systemFactory()

const MediaProcessPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [folderPath, setFolderPath] = useState('')
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const onFinish = async () => {
    if (!folderPath) {
      message.error('Please select a folder first.')
      return
    }
    setLogs([])
    setUploading(true)
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
        setUploading(false)
        if (code === 0) {
          message.success('Upload complete!')
        } else {
          message.error('Upload failed (exit code ' + code + ')')
        }
      }
    )
  }

  const handleSelectFolder = async () => {
    const path = await systemRepo.selectFolder()
    if (path) {
      setFolderPath(path)
    } else {
      renderErrorNotification({
        message: 'No folder selected'
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Media Processing"
        description="Process media files from a selected folder and upload them to a Google Cloud Storage bucket."
      />
      <Row gutter={[16, 16]}>
        <Col lg={10} xs={24}>
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
                  <Button
                    loading={uploading}
                    danger
                    type="primary"
                    htmlType="submit"
                    block
                    disabled={uploading}
                  >
                    Upload
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col lg={14} xs={24}>
          <LogsViewer logRef={logRef} logs={logs} />
        </Col>
      </Row>
    </div>
  )
}

const MediaProcessPage = withNotification(MediaProcessPageWOC)

export default MediaProcessPage
