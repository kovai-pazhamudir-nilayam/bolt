import { Badge, Button, Card, Col, Form, Input, Row, Space, Typography, Upload } from 'antd'
import { CloudDownload, CloudUpload, FolderOpen, Plug, Unplug } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import SelectFormItem from '../../components/SelectFormItem'
import { useDevPanel } from '../../context/useDevPanel'
import withNotification from '../../hoc/withNotification'
import { shellFactory } from '../../repos/shell.repo'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { systemFactory } from '../../repos/system.repo'

const { Text } = Typography
const { Dragger } = Upload

const { shellRepo } = shellFactory()
const { systemRepo } = systemFactory()
const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()

const CONNECTION_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
}

const statusBadge = {
  [CONNECTION_STATUS.IDLE]: { status: 'default', text: 'Not connected' },
  [CONNECTION_STATUS.CONNECTING]: { status: 'processing', text: 'Connecting...' },
  [CONNECTION_STATUS.CONNECTED]: null,
  [CONNECTION_STATUS.ERROR]: { status: 'error', text: 'Connection failed' }
}

const JumpboxTransferPageWOC = ({ renderSuccessNotification, renderErrorNotification }) => {
  const { appendLog, openTab } = useDevPanel()
  const [loading, setLoading] = useState(false)

  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.IDLE)
  const [jumpboxPod, setJumpboxPod] = useState(null)
  const [datasource, setDatasource] = useState({ companies: [], environments: [] })

  const [connectForm] = Form.useForm()
  const [uploadForm] = Form.useForm()
  const [downloadForm] = Form.useForm()

  const [selectedFilePath, setSelectedFilePath] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState(null)

  const loadDatasource = async () => {
    const [companies, environments] = await Promise.all([
      companyRepo.getAll(),
      environmentRepo.getAll()
    ])
    setDatasource({ companies, environments })
  }

  useEffect(() => {
    loadDatasource()
  }, [])

  const getJumpboxPod = async () => {
    let output = ''
    const unsub = shellRepo.onLog((data) => {
      if (data.type === 'stdout') output += data.output
    })
    const result = await shellRepo.run(
      'kubectl get pods -o=name --field-selector=status.phase=Running'
    )
    unsub()
    if (result.code !== 0) throw new Error('Failed to list kubectl pods')
    const pod = output
      .split('\n')
      .find((l) => l.includes('jumpbox'))
      ?.split('/')[1]
      ?.trim()
    if (!pod) throw new Error('No running jumpbox pod found')
    return pod
  }

  const handleConnect = async (values) => {
    setConnectionStatus(CONNECTION_STATUS.CONNECTING)
    setJumpboxPod(null)
    setLoading(true)
    openTab('logs')

    const gcpConfig = await gcpProjectConfigRepo.getOne({
      company_code: values.company_code,
      env_code: values.env_code
    })

    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = gcpConfig || {}
    if (!cluster || !region || !project) {
      renderErrorNotification({ message: 'Missing GCP config (cluster, region, or project)' })
      setConnectionStatus(CONNECTION_STATUS.ERROR)
      setLoading(false)
      return
    }

    appendLog('# Authenticating with GCP cluster...')
    const authResult = await shellRepo.run(
      `gcloud container clusters get-credentials ${cluster} --region ${region} --project ${project}`
    )
    if (authResult.code !== 0) {
      renderErrorNotification({ message: 'GCP authentication failed' })
      setConnectionStatus(CONNECTION_STATUS.ERROR)
      setLoading(false)
      return
    }

    appendLog('# Discovering jumpbox pod...')
    const pod = await getJumpboxPod()
    setJumpboxPod(pod)
    setConnectionStatus(CONNECTION_STATUS.CONNECTED)
    appendLog(`# Connected to: ${pod}`)
    setLoading(false)
  }

  const handleDisconnect = () => {
    setJumpboxPod(null)
    setConnectionStatus(CONNECTION_STATUS.IDLE)
  }

  const handleSelectFile = async () => {
    const filePath = await systemRepo.selectFile()
    if (!filePath) return
    const name = filePath.split('/').pop()
    setSelectedFilePath(filePath)
    setSelectedFileName(name)
    uploadForm.setFieldValue('dest_path', `/tmp/${name}`)
  }

  const handleUpload = async (values) => {
    if (!jumpboxPod) {
      renderErrorNotification({ message: 'Not connected. Please connect first.' })
      return
    }
    if (!selectedFilePath) {
      renderErrorNotification({ message: 'Please select a file to upload.' })
      return
    }

    setLoading(true)
    openTab('logs')
    const destPath = values.dest_path || `/tmp/${selectedFileName}`
    const command = `kubectl cp "${selectedFilePath}" default/${jumpboxPod}:${destPath}`

    appendLog(`# Copying ${selectedFileName} → ${destPath}`)
    appendLog(`# Running: ${command}`)

    const unsub = shellRepo.onLog((data) => {
      if (data.output) appendLog(data.output)
    })

    const result = await shellRepo.run(command)
    unsub()

    if (result.code === 0) {
      appendLog(`# ✓ File copied successfully to ${destPath}`)
      renderSuccessNotification({ message: `Copied to jumpbox: ${destPath}` })
    } else {
      appendLog(`# ✗ Copy failed (exit code ${result.code})`)
      renderErrorNotification({ message: 'File copy failed. Check logs for details.' })
    }
    setLoading(false)
  }

  const handleDownload = async (values) => {
    if (!jumpboxPod) {
      renderErrorNotification({ message: 'Not connected. Please connect first.' })
      return
    }

    const jumpboxPath = values.jumpbox_path
    const defaultName = jumpboxPath.split('/').pop()
    const savePath = await systemRepo.saveFileDialog(defaultName)
    if (!savePath) return

    setLoading(true)
    openTab('logs')
    const command = `kubectl cp default/${jumpboxPod}:${jumpboxPath} "${savePath}"`

    appendLog(`# Downloading ${jumpboxPath} → ${savePath}`)
    appendLog(`# Running: ${command}`)

    const unsub = shellRepo.onLog((data) => {
      if (data.output) appendLog(data.output)
    })

    const result = await shellRepo.run(command)
    unsub()

    if (result.code === 0) {
      appendLog(`# ✓ File saved to ${savePath}`)
      renderSuccessNotification({ message: `Saved to: ${savePath}` })
    } else {
      appendLog(`# ✗ Download failed (exit code ${result.code})`)
      renderErrorNotification({ message: 'Download failed. Check logs for details.' })
    }
    setLoading(false)
  }

  const isConnected = connectionStatus === CONNECTION_STATUS.CONNECTED

  return (
    <div>
      <PageHeader
        title="Jumpbox File Transfer"
        description="Copy files to and from your GCP Kubernetes jumpbox pod."
      />

      {/* Connection Card */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={connectForm} layout="inline" onFinish={handleConnect}>
          <SelectFormItem
            options={datasource.companies}
            name="company_code"
            label="Company"
            transform="COMPANIES"
            placeholder="Select Company"
            loading={loading}
          />
          <SelectFormItem
            options={datasource.environments}
            name="env_code"
            label="Environment"
            transform="ENVIRONMENTS"
            placeholder="Select Environment"
            loading={loading}
          />
          <Form.Item label=" ">
            <Space>
              {!isConnected ? (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={connectionStatus === CONNECTION_STATUS.CONNECTING}
                  icon={<Plug size={14} />}
                >
                  Connect
                </Button>
              ) : (
                <Button danger icon={<Unplug size={14} />} onClick={handleDisconnect}>
                  Disconnect
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 8 }}>
          {isConnected ? (
            <Badge
              status="success"
              text={
                <Text>
                  Connected: <Text strong>{jumpboxPod}</Text>
                </Text>
              }
            />
          ) : (
            <Badge
              status={statusBadge[connectionStatus].status}
              text={statusBadge[connectionStatus].text}
            />
          )}
        </div>
      </Card>

      {/* Transfer Cards */}
      <Row gutter={16}>
        {/* Upload Card */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <CloudUpload size={16} />
                Copy to Jumpbox
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Form form={uploadForm} layout="vertical" onFinish={handleUpload}>
              <Form.Item label="File">
                <Dragger
                  beforeUpload={(file) => {
                    setSelectedFilePath(file.path)
                    setSelectedFileName(file.name)
                    uploadForm.setFieldValue('dest_path', `/tmp/${file.name}`)
                    return false
                  }}
                  showUploadList={false}
                  maxCount={1}
                  style={{ padding: '8px 0' }}
                >
                  <p style={{ fontSize: 32, marginBottom: 4 }}>
                    <FolderOpen size={36} style={{ margin: '0 auto', display: 'block' }} />
                  </p>
                  <p style={{ marginBottom: 4 }}>Drag & drop a file here</p>
                  <p style={{ fontSize: 12, color: '#999' }}>or</p>
                  <Button
                    size="small"
                    style={{ marginTop: 4 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectFile()
                    }}
                  >
                    Browse File
                  </Button>
                </Dragger>
                {selectedFileName && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Selected:
                    </Text>{' '}
                    <Text strong style={{ fontSize: 12 }}>
                      {selectedFileName}
                    </Text>
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="dest_path"
                label="Destination path on jumpbox"
                rules={[{ required: true, message: 'Enter destination path' }]}
              >
                <Input placeholder="/tmp/filename.csv" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!isConnected}
                icon={<CloudUpload size={14} />}
                block
              >
                Copy to Jumpbox
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Download Card */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <CloudDownload size={16} />
                Download from Jumpbox
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Form form={downloadForm} layout="vertical" onFinish={handleDownload}>
              <Form.Item
                name="jumpbox_path"
                label="File path on jumpbox"
                rules={[{ required: true, message: 'Enter file path on jumpbox' }]}
              >
                <Input placeholder="/tmp/acc_product.csv" />
              </Form.Item>

              <div style={{ marginBottom: 16, color: '#999', fontSize: 12 }}>
                A save dialog will open to choose where to save the file on your machine.
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!isConnected}
                icon={<CloudDownload size={14} />}
                block
              >
                Download to Local Machine
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

    </div>
  )
}

const JumpboxTransferPage = withNotification(JumpboxTransferPageWOC)

export default JumpboxTransferPage
