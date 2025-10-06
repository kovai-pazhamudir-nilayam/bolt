import { Button, Col, Form, Row, Select } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import PageHeader from '../../components/PageHeader/PageHeader'
import SubmitBtnForm from '../../components/SubmitBtnForm'
import SelectFormItem from '../../components/SelectFormItem'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { shellFactory } from '../../repos/shell.repo'
import { systemFactory } from '../../repos/system.repo'
const { systemRepo } = systemFactory()
const { shellRepo } = shellFactory()
const { companyRepo, environmentRepo, mediaConfigRepo } = settingsFactory()

const ITEMS = ['PRODUCT', 'CATEGORY', 'BRAND']

const MediaProcessPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [folderPath, setFolderPath] = useState('')
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: []
  })
  const [folderError, setFolderError] = useState('')
  const logUnsubRef = useRef(null)
  const endUnsubRef = useRef(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [allCompanies, allEnvironments] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])

      setDatasource({
        environments: allEnvironments,
        companies: allCompanies
      })
    } catch (error) {
      renderErrorNotification(error)
    } finally {
      setLoading(false)
    }
  }, [renderErrorNotification])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (logUnsubRef.current) {
        logUnsubRef.current()
      }
      if (endUnsubRef.current) {
        endUnsubRef.current()
      }
    }
  }, [])

  const onFinish = async (values) => {
    if (!folderPath) {
      setFolderError('Please select a folder first.')
      return
    }

    // Clear any previous folder error
    setFolderError('')

    setLogs([])
    setUploading(true)

    try {
      // Step 1: Log form values
      setLogs((prev) => [...prev, `#1 ---> Processing form values:`])
      setLogs((prev) => [...prev, `    Company: ${values.company_code}`])
      setLogs((prev) => [...prev, `    Environment: ${values.env_code}`])
      setLogs((prev) => [...prev, `    Type: ${values.type}`])
      setLogs((prev) => [...prev, `    Selected Folder: ${folderPath}`])

      // Step 2: Fetch media configuration
      setLogs((prev) => [...prev, `#2 ---> Fetching media configuration...`])
      const mediaConfigs = await mediaConfigRepo.getAll()
      // Find matching config based on form values
      const matchingConfig = mediaConfigs.find(
        (config) =>
          config.company_code === values.company_code &&
          config.env_code === values.env_code &&
          config.type === values.type
      )

      if (!matchingConfig) {
        setLogs((prev) => [...prev, `❌ ERROR: No media configuration found for:`])
        setLogs((prev) => [...prev, `    Company: ${values.company_code}`])
        setLogs((prev) => [...prev, `    Environment: ${values.env_code}`])
        setLogs((prev) => [...prev, `    Type: ${values.type}`])
        setLogs((prev) => [...prev, `Please configure this combination in Settings > Media Config`])
        setUploading(false)
        renderErrorNotification({
          message: 'No media configuration found. Please configure this combination in Settings.'
        })
        return
      }

      setLogs((prev) => [...prev, `✅ Found media configuration:`])
      setLogs((prev) => [...prev, `    Bucket Path: ${matchingConfig.bucket_path}`])
      setLogs((prev) => [...prev, `    Config ID: ${matchingConfig.id}`])

      // Step 3: Prepare upload command
      const bucket_name = matchingConfig.bucket_path
      const command = `gsutil -m cp -r "${folderPath}"/* gs://${bucket_name}/images/`
      setLogs((prev) => [...prev, `#3 ---> Preparing upload command:`])
      setLogs((prev) => [...prev, `    Command: ${command}`])
      setLogs((prev) => [...prev, `    Source: ${folderPath}/*`])
      setLogs((prev) => [...prev, `    Destination: gs://${bucket_name}`])

      // Step 4: Execute upload
      setLogs((prev) => [...prev, `#4 ---> Starting upload process...`])
      setLogs((prev) => [...prev, `    This may take a while depending on file sizes...`])

      // Clean up any existing listeners first
      if (logUnsubRef.current) {
        logUnsubRef.current()
        logUnsubRef.current = null
      }
      if (endUnsubRef.current) {
        endUnsubRef.current()
        endUnsubRef.current = null
      }

      // Set up event listeners
      const handleLog = (data) => {
        const { output } = data
        setLogs((prev) => [...prev, `    ${output}`])
        // Auto-scroll to bottom
        setTimeout(() => {
          if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
        }, 0)
      }

      const handleEnd = (data) => {
        const { code } = data
        setUploading(false)

        // Clean up listeners
        if (logUnsubRef.current) {
          logUnsubRef.current()
          logUnsubRef.current = null
        }
        if (endUnsubRef.current) {
          endUnsubRef.current()
          endUnsubRef.current = null
        }

        if (code === 0) {
          setLogs((prev) => [...prev, `#5 ---> ✅ Upload completed successfully!`])
          setLogs((prev) => [...prev, `    Files uploaded to: gs://${bucket_name}`])
          renderSuccessNotification({ message: 'Upload complete!' })
        } else {
          setLogs((prev) => [...prev, `#5 ---> ❌ Upload failed!`])
          setLogs((prev) => [...prev, `    Exit code: ${code}`])
          setLogs((prev) => [...prev, `    Please check the logs above for details`])
          renderErrorNotification({ message: 'Upload failed (exit code ' + code + ')' })
        }
      }

      // Register listeners
      logUnsubRef.current = shellRepo.onLog(handleLog)
      endUnsubRef.current = shellRepo.onEnd(handleEnd)

      // Execute the command
      try {
        await shellRepo.run(command)
      } catch (error) {
        setUploading(false)
        setLogs((prev) => [...prev, `❌ ERROR: Failed to start command`])
        setLogs((prev) => [...prev, `    ${error.message}`])
        renderErrorNotification({ message: error.message })
      }
    } catch (error) {
      setUploading(false)
      setLogs((prev) => [...prev, `❌ ERROR: ${error.message}`])
      setLogs((prev) => [...prev, `    Please check your configuration and try again`])
      renderErrorNotification({ message: error.message })
    }
  }

  const handleSelectFolder = async () => {
    const path = await systemRepo.selectFolder()
    if (path) {
      setFolderPath(path)
      setFolderError('') // Clear error when folder is selected
    } else {
      setFolderError('No folder selected')
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
          <Form layout="vertical" onFinish={onFinish} loading={loading}>
            <SelectFormItem
              options={datasource.companies}
              name="company_code"
              label="Company"
              transform="COMPANIES"
            />
            <SelectFormItem
              options={datasource.environments}
              name="env_code"
              label="Environment"
              transform="ENVIRONMENTS"
            />
            <Form.Item
              name="type"
              label="Choose a item"
              rules={[
                {
                  required: true,
                  message: `Please select type`
                }
              ]}
            >
              <Select
                style={{ width: '100%' }}
                placeholder="Select type"
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
                <strong>Select folder to upload:</strong>
              </Col>
              <Col xs={12} lg={12}>
                <Button type="dashed" block onClick={handleSelectFolder}>
                  Select Folder
                </Button>
                {folderPath && (
                  <div style={{ marginTop: 8, wordBreak: 'break-all', fontSize: 12 }}>
                    <b>Selected folder:</b> {folderPath}
                  </div>
                )}
                {folderError && (
                  <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 14 }}>{folderError}</div>
                )}
              </Col>
            </Row>
            <SubmitBtnForm loading={uploading} btnText="Upload" />
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
