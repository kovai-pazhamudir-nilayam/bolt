import { Button, Space, Tooltip, message } from 'antd'
import { Monitor, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useFeatureConfig } from '../../context/featureConfigContext'
import { ROUTES } from '../../routing.jsx'
import AddFeatureModal from './_blocks/AddFeatureModal'
import AppPreviewModal from './_blocks/AppPreviewModal'
import ConfigAssistant from './_blocks/ConfigAssistant'
import FeatureTable from './_blocks/FeatureTable'

const FeatureConfigPage = () => {
  const { featureConfigs, loading, updateFeatureAccessLevel, loadFeatureConfigs } =
    useFeatureConfig()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleAccessChange = async (featureKey, newAccess) => {
    await updateFeatureAccessLevel(featureKey, newAccess)
    message.success('Access updated')
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
          <Tooltip title="Refresh">
            <Button icon={<RefreshCw size={16} />} onClick={loadFeatureConfigs} loading={loading} />
          </Tooltip>
        </Space>
      </div>

      <FeatureTable
        features={featureConfigs}
        loading={loading}
        onAccessChange={handleAccessChange}
      />

      <ConfigAssistant />

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
