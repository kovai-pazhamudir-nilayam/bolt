import { Button, Form, Input, Modal, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { Save } from 'lucide-react'

const SavedDBQueryModal = ({
  editingId,
  setIsModalOpen,
  modalForm,
  handleSaveQuery,
  allDbOptions,
  loading
}) => {
  return (
    <Modal
      title={editingId ? 'Edit Query' : 'Add Query'}
      open={true}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
      width={700}
    >
      <Form form={modalForm} onFinish={handleSaveQuery} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input />
        </Form.Item>
        <Form.Item name="db_id" label="Database" rules={[{ required: true }]}>
          <Select options={allDbOptions} showSearch placeholder="Select associated database" />
        </Form.Item>
        <Form.Item name="query" label="SQL Query" rules={[{ required: true }]}>
          <TextArea rows={6} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<Save size={16} />}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SavedDBQueryModal
