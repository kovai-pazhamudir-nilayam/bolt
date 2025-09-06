import { useState } from 'react'
import { Modal, Button, Form, Select } from 'antd'
import kpnLogo from '../assets/kpn.svg'
import iboLogo from '../assets/ibo.svg'
import savoLogo from '../assets/savo.png'
import { useMasterDataContext } from '../context/masterDataContext'

const BRAND_OPTIONS = [
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={kpnLogo} alt="KPN" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        KPN
      </span>
    ),
    value: 'kpn'
  },
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={iboLogo} alt="IBO" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        IBO
      </span>
    ),
    value: 'ibo'
  },
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img
          src={savoLogo}
          alt="Savomart"
          style={{ width: 20, height: 20, objectFit: 'contain' }}
        />
        Savomart
      </span>
    ),
    value: 'savomart'
  }
]
const ENV_OPTIONS = [
  { label: 'Staging', value: 'STAGING' },
  { label: 'Production', value: 'PRODUCTION' }
]

const MasterSelectionModal = () => {
  const { brand, environment, setMasterData } = useMasterDataContext()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const handleOpen = () => setOpen(true)
  const handleCancel = () => setOpen(false)
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setMasterData(values)
      setOpen(false)
    } catch {}
  }

  // Find the selected brand label (with logo)
  const selectedBrand = BRAND_OPTIONS.find((b) => b.value === brand)?.label
  const selectedEnv = ENV_OPTIONS.find((e) => e.value === environment)?.label

  return (
    <>
      <Button onClick={handleOpen} style={{ marginLeft: 8 }}>
        {selectedBrand || 'Select Brand'}
        {selectedBrand && selectedEnv ? ' | ' : ''}
        {selectedEnv || (!selectedBrand && 'Select Environment')}
      </Button>
      <Modal
        title="Select Brand & Environment"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save"
      >
        <Form form={form} layout="vertical" initialValues={{ brand, environment }}>
          <Form.Item
            name="brand"
            label="Brand"
            rules={[{ required: true, message: 'Please select a brand' }]}
          >
            <Select options={BRAND_OPTIONS} placeholder="Select brand" />
          </Form.Item>
          <Form.Item
            name="environment"
            label="Environment"
            rules={[{ required: true, message: 'Please select an environment' }]}
          >
            <Select options={ENV_OPTIONS} placeholder="Select environment" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default MasterSelectionModal
