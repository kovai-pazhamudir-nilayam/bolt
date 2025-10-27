import { Button, Col, Form, Row, Select } from 'antd'
import { useRef, useState } from 'react'
import CompanySelection from '../../components/CompanySelection'
import EnvironmentSelection from '../../components/EnvironmentSelection'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import PageHeader from '../../components/PageHeader/PageHeader'
import SubmitBtnForm from '../../components/SubmitBtnForm'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { systemFactory } from '../../repos/system.repo'
import { shellFactory } from '../../repos/shell.repo'
const { systemRepo } = systemFactory()
const { mediaConfigRepo, coreConfigRepo } = settingsFactory()
const { shellRepo } = shellFactory()

const media_processor_uri = {
  PRODUCT: 'v1/products',
  BRAND: 'v1/brands',
  CATEGORY: 'v1/categories'
}

const ITEMS = ['PRODUCT', 'CATEGORY', 'BRAND']

// Helper function to upload files to GCP bucket
const uploadToGCP = async ({ folderPath, bucketPath }) => {
  const command = `gsutil -m cp -r ${folderPath}/* gs://${bucketPath}/images`

  console.log(`Running command: ${command}`)

  // Just run the command and wait for completion
  return shellRepo.run(command)
}

// Helper function to construct API payload
const constructPayload = async ({ media_path }) => {
  const categories = await systemRepo.listFiles(media_path)
  return {
    csv_file_name: `category_${new Date().toISOString().split('T')[0]}.csv`,
    brands: categories.map((item) => {
      return {
        brand_id: item.split('.')[0],
        media_type: 'images',
        is_primary_for_store: true,
        is_primary_for_scm: true,
        position: 1,
        media_name: item
      }
    }),
    audit: {
      created_by: 'pankaj.ladhar@ibo.com'
    }
  }
}
///

const makeCoreTokenAPIRequest = async ({ url, key }) => {
  console.log(`Making api call to ${url}`)
  try {
    return await systemRepo.httpRequest(url, {
      method: 'POST', // Specify the request method
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': key
      }
    })
  } catch (error) {
    console.error('Error making core token API request:', error)
    throw error
  }
}

// Helper function to make API call
const makeAPICall = async ({ payload, authToken, domain, type }) => {
  const url = `${domain}/media-processor/${media_processor_uri[type]}`

  console.log(`Making api call to ${url}`)

  try {
    const jsonResponse = await systemRepo.httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken.token
      },
      body: payload
    })
    return jsonResponse
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

const MediaProcessPageWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [folderPath, setFolderPath] = useState('')
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const [folderError, setFolderError] = useState('')

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

      // Step 3: Fetch core configuration for API credentials
      setLogs((prev) => [...prev, `#3 ---> Fetching core configuration...`])
      const coreConfigs = await coreConfigRepo.getAll()
      const matchingCoreConfig = coreConfigs.find(
        (config) =>
          config.company_code === values.company_code && config.env_code === values.env_code
      )

      if (!matchingCoreConfig) {
        setLogs((prev) => [...prev, `❌ ERROR: No core configuration found for:`])
        setLogs((prev) => [...prev, `    Company: ${values.company_code}`])
        setLogs((prev) => [...prev, `    Environment: ${values.env_code}`])
        setLogs((prev) => [...prev, `Please configure this combination in Settings > Core Config`])
        setUploading(false)
        renderErrorNotification({
          message: 'No core configuration found. Please configure this combination in Settings.'
        })
        return
      }

      setLogs((prev) => [...prev, `✅ Found core configuration:`])
      setLogs((prev) => [...prev, `    Base URL: ${matchingCoreConfig.base_url}`])
      setLogs((prev) => [...prev, `    Auth API: ${matchingCoreConfig.auth_api}`])

      //
      const authToken = await makeCoreTokenAPIRequest({
        url: matchingCoreConfig.auth_api,
        key: matchingCoreConfig.auth_api_key
      })

      const domain = matchingCoreConfig.base_url

      // Step 4: Upload files to GCP bucket
      setLogs((prev) => [...prev, `#4 ---> Uploading files to GCP bucket...`])
      setLogs((prev) => [...prev, `    Bucket: ${matchingConfig.bucket_path}`])
      setLogs((prev) => [...prev, `    Source: ${folderPath}`])

      try {
        await uploadToGCP({
          folderPath,
          bucketPath: matchingConfig.bucket_path
        })
        setLogs((prev) => [...prev, `✅ Files uploaded to GCP Bucket successfully!`])
      } catch (uploadError) {
        setLogs((prev) => [...prev, `❌ ERROR: Failed to upload files to GCP Bucket`])
        setLogs((prev) => [...prev, `    ${uploadError.message}`])
        setUploading(false)
        renderErrorNotification({
          message: 'Failed to upload files to GCP Bucket: ' + uploadError.message
        })
        return
      }

      // Step 5: Process media files
      setLogs((prev) => [...prev, `#5 ---> Processing media files...`])
      setLogs((prev) => [...prev, `    Scanning folder: ${folderPath}`])

      try {
        const fileList = await systemRepo.listFiles(folderPath)
        setLogs((prev) => [...prev, `    Found ${fileList.length} files:`])
        fileList.forEach((file, index) => {
          setLogs((prev) => [...prev, `    ${index + 1}. ${file}`])
        })

        // Step 6: Construct API payload
        setLogs((prev) => [...prev, `#6 ---> Constructing API payload...`])
        const payload = await constructPayload({ media_path: folderPath })
        setLogs((prev) => [...prev, `    CSV file name: ${payload.csv_file_name}`])
        setLogs((prev) => [...prev, `    Brands count: ${payload.brands.length}`])

        // Step 7: Make API call
        setLogs((prev) => [...prev, `#7 ---> Making API call...`])
        setLogs((prev) => [
          ...prev,
          `    URL: ${domain}/media-processor/${media_processor_uri[values.type]}`
        ])

        const response = await makeAPICall({
          payload,
          authToken,
          domain,
          type: values.type
        })

        setLogs((prev) => [...prev, `#8 ---> ✅ API call completed successfully!`])
        setLogs((prev) => [...prev, `    Response: ${JSON.stringify(response, null, 2)}`])
        renderSuccessNotification({ message: 'Media processing complete!' })
      } catch (fileError) {
        setLogs((prev) => [...prev, `❌ ERROR: Failed to process media files`])
        setLogs((prev) => [...prev, `    ${fileError.message}`])
        renderErrorNotification({ message: 'Failed to process media files: ' + fileError.message })
      }
    } catch (error) {
      setUploading(false)
      setLogs((prev) => [...prev, `❌ ERROR: ${error.message}`])
      setLogs((prev) => [...prev, `    Please check your configuration and try again`])
      renderErrorNotification({ message: error.message })
    } finally {
      setUploading(false)
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
          <Form layout="vertical" onFinish={onFinish}>
            <CompanySelection />
            <EnvironmentSelection />
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
