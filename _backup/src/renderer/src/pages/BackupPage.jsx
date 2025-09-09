import { Download, FileText, Upload as UploadIcon } from 'lucide-react'
import { Alert, Button, Card, Tabs, message, Space, Spin, Typography, Upload } from 'antd'
import { useState } from 'react'
import PageHeader from '../components/PageHeader/PageHeader'

const { Text } = Typography
const { Dragger } = Upload

const BackupPage = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const result = await window.api.backup.export()

      if (result.success) {
        message.success('Database exported successfully!')

        // Create download link
        const blob = new Blob([result.data], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        message.error('Failed to export database: ' + result.error)
      }
    } catch (error) {
      message.error('Error exporting database: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (file) => {
    try {
      setIsImporting(true)
      const fileContent = await file.text()
      const result = await window.api.backup.import(fileContent)

      if (result.success) {
        message.success('Database imported successfully!')
        // Optionally refresh the page or trigger a data reload
        window.location.reload()
      } else {
        message.error('Failed to import database: ' + result.error)
      }
    } catch (error) {
      message.error('Error importing database: ' + error.message)
    } finally {
      setIsImporting(false)
    }
    return false // Prevent default upload behavior
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    beforeUpload: handleImport,
    showUploadList: false
  }

  return (
    <div>
      <PageHeader
        title="Database Backup & Restore"
        description="Backup and restore your application data. Export creates a complete backup of all your configuration data, while import allows you to restore from a previous backup."
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Tabs
          items={[
            {
              key: 'backup',
              label: (
                <span>
                  <FileText size={16} style={{ marginRight: 8 }} /> Backup
                </span>
              ),
              children: (
                <Card style={{ width: '100%' }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Text>
                      Download a complete backup of your database. This includes all your
                      configurations, companies, environments, GitHub users, and settings.
                    </Text>

                    <Alert
                      message="Export Information"
                      description="The backup file will contain all your data in JSON format. Keep this file safe as it contains sensitive configuration information."
                      type="info"
                      showIcon
                    />

                    <Button
                      type="primary"
                      icon={<Download size={16} />}
                      onClick={handleExport}
                      loading={isExporting}
                      size="large"
                      style={{ marginTop: 16 }}
                    >
                      {isExporting ? 'Exporting...' : 'Export Database'}
                    </Button>
                  </Space>
                </Card>
              )
            },
            {
              key: 'restore',
              label: (
                <span>
                  <UploadIcon size={16} style={{ marginRight: 8 }} /> Restore
                </span>
              ),
              children: (
                <Card style={{ width: '100%' }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Text>
                      Restore your database from a previous backup. This will replace all current
                      data with the data from the backup file.
                    </Text>

                    <Alert
                      message="Warning"
                      description="Importing will replace ALL current data. Make sure to export a backup before importing if you want to keep your current data."
                      type="warning"
                      showIcon
                    />

                    <Dragger {...uploadProps} style={{ marginTop: 16 }}>
                      <p className="ant-upload-drag-icon">
                        <UploadIcon size={48} color="#1890ff" />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag JSON backup file to this area to upload
                      </p>
                      <p className="ant-upload-hint">
                        Only JSON files from previous exports are supported
                      </p>
                    </Dragger>

                    {isImporting && (
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 8 }}>
                          <Text>Importing database...</Text>
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              )
            }
          ]}
          size="large"
        />

        {/* Additional Information */}
        <Card title="Backup Information" style={{ width: '100%' }}>
          <Space direction="vertical" size="small">
            <Text strong>What&apos;s included in the backup:</Text>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>User preferences and settings</li>
              <li>Company configurations</li>
              <li>Environment settings</li>
              <li>Core token configurations</li>
              <li>GCP project configurations</li>
              <li>GitHub configurations</li>
              <li>User data</li>
              <li>Legacy brand configurations</li>
            </ul>

            <Text strong style={{ marginTop: 16, display: 'block' }}>
              Important Notes:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Backup files are in JSON format and contain sensitive information</li>
              <li>Keep backup files secure and don&apos;t share them</li>
              <li>Import will completely replace your current data</li>
              <li>Always create a backup before importing</li>
            </ul>
          </Space>
        </Card>
      </Space>
    </div>
  )
}

export default BackupPage
