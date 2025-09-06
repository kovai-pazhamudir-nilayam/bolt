import { useState } from 'react'
import { Modal, Button, Form, Select } from 'antd'
import kpnLogo from '../assets/kpn.svg'
import iboLogo from '../assets/ibo.svg'
import savoLogo from '../assets/savo.png'
import { useMasterDataContext } from '../context/masterDataContext'

const ENV_OPTIONS = [
  { label: 'Staging', value: 'STAGING' },
  { label: 'Production', value: 'PRODUCTION' }
]

const MasterSelectionModal = () => {
  const { companyCode, environmentCode, companies, setMasterData } = useMasterDataContext()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const handleOpen = () => setOpen(true)
  const handleCancel = () => setOpen(false)
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setMasterData({
        companyCode: values.companyCode,
        environmentCode: values.environmentCode
      })
      setOpen(false)
    } catch {}
  }

  const companyOptions = (companies || []).map((c) => ({
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Optionally map known codes to local logos */}
        {c.code === 'KPN' && (
          <img src={kpnLogo} alt="KPN" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        )}
        {c.code === 'IBO' && (
          <img src={iboLogo} alt="IBO" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        )}
        {c.code !== 'KPN' && c.code !== 'IBO' && (
          <img src={savoLogo} alt={c.code} style={{ width: 20, height: 20, objectFit: 'contain' }} />
        )}
        {c.name || c.code}
      </span>
    ),
    value: c.code
  }))
  const selectedCompany = companyOptions.find((b) => b.value === companyCode)?.label
  const selectedEnv = ENV_OPTIONS.find((e) => e.value === environmentCode)?.label

  return (
    <>
      <Button onClick={handleOpen} style={{ marginLeft: 8 }}>
        {selectedCompany || 'Select Company'}
        {selectedCompany && selectedEnv ? ' | ' : ''}
        {selectedEnv || (!selectedCompany && 'Select Environment')}
      </Button>
      <Modal
        title="Select Company & Environment"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save"
      >
        <Form form={form} layout="vertical" initialValues={{ companyCode, environmentCode }}>
          <Form.Item
            name="companyCode"
            label="Company"
            rules={[{ required: true, message: 'Please select a company' }]}
          >
            <Select options={companyOptions} placeholder="Select company" />
          </Form.Item>
          <Form.Item
            name="environmentCode"
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
