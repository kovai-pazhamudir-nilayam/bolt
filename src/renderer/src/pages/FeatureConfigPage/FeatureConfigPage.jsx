import { Button, Popconfirm, Space, Tooltip, message } from 'antd'
import { Monitor, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useFeatureConfig } from '../../context/featureConfigContext'
import { ROUTES } from '../../routing.jsx'
import AddFeatureModal from './_blocks/AddFeatureModal'
import AppPreviewModal from './_blocks/AppPreviewModal'
import FeatureTable from './_blocks/FeatureTable'
import MissingConfigsPanel from './_blocks/MissingConfigsPanel'

const FeatureConfigPage = () => {
  const { featureConfigs, loading, updateFeatureAccessLevel, loadFeatureConfigs } =
    useFeatureConfig()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleAccessChange = async (featureKey, newAccess) => {
    await updateFeatureAccessLevel(featureKey, newAccess)
    message.success('Access updated')
  }

  const handleDelete = async (featureKey) => {
    await window.featureConfigAPI.deleteFeatureConfig(featureKey)
    message.success('Config deleted')
    loadFeatureConfigs()
  }

  const handleDeleteAll = async () => {
    await window.featureConfigAPI.deleteAllFeatureConfigs()
    message.success('All configs deleted')
    loadFeatureConfigs()
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 8
        }}
      >
        <PageHeader
          title="Feature Configuration"
          description="Control page visibility and access across the app. Changes reflect in the sidebar immediately."
        />
        <Space style={{ flexShrink: 0, marginTop: 4 }}>
          <Button icon={<Monitor size={16} />} onClick={() => setPreviewOpen(true)}>
            Preview App
          </Button>
          <Button icon={<Plus size={16} />} type="primary" onClick={() => setAddModalOpen(true)}>
            Add Feature
          </Button>
          <Popconfirm
            title="Delete all feature configs?"
            description="All pages and tabs will be hidden until re-added."
            onConfirm={handleDeleteAll}
            okText="Delete All"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<Trash2 size={16} />} danger disabled={featureConfigs.length === 0}>
              Delete All
            </Button>
          </Popconfirm>
          <Tooltip title="Refresh">
            <Button icon={<RefreshCw size={16} />} onClick={loadFeatureConfigs} loading={loading} />
          </Tooltip>
        </Space>
      </div>

      <MissingConfigsPanel
        routes={ROUTES}
        featureConfigs={featureConfigs}
        onAdded={loadFeatureConfigs}
      />

      <FeatureTable
        features={featureConfigs}
        loading={loading}
        onAccessChange={handleAccessChange}
        onDelete={handleDelete}
      />

      <AddFeatureModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={loadFeatureConfigs}
      />

      <AppPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        features={featureConfigs}
        routes={ROUTES}
      />
    </div>
  )
}

export default FeatureConfigPage
