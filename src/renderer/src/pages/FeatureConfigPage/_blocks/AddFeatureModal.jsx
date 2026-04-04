import { Input, Modal, Space, message } from 'antd'
import { useState } from 'react'

const AddFeatureModal = ({ open, onClose, onAdded }) => {
  const [name, setName] = useState('')
  const [key, setKey] = useState('')

  const handleOk = async () => {
    if (!name.trim() || !key.trim()) {
      message.warning('Feature name and key are required')
      return
    }
    await window.featureConfigAPI.upsertFeatureConfig({
      feature_key: key.trim(),
      feature_name: name.trim(),
      feature_type: 'page',
      access_level: 'write',
      description: ''
    })
    message.success('Feature added')
    setName('')
    setKey('')
    onAdded()
    onClose()
  }

  const handleCancel = () => {
    setName('')
    setKey('')
    onClose()
  }

  return (
    <Modal title="Add Feature" open={open} onOk={handleOk} onCancel={handleCancel} okText="Add">
      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Input
          placeholder="Feature name (e.g. Reports)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Feature key (e.g. reports)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </Space>
    </Modal>
  )
}

export default AddFeatureModal
