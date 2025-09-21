import { Button, DatePicker, Form, Input, Modal } from 'antd'
import { useState } from 'react'
import { tasksFactory } from '../../../repos/taskPage.repo'
const { taskRepo } = tasksFactory()

const AddTaskListModal = ({ onCancel }) => {
  const [loading, setLoading] = useState(false)
  const onFinish = async (values) => {
    setLoading(true)
    await taskRepo.create({
      title: values.title,
      description: values.description,
      company_code: values.company,
      reminder_at: values.reminder ? values.reminder.toISOString() : null
    })
    setLoading(false)
    // fetchTasks()
  }
  return (
    <Modal footer={null} title="Add Task" open={true} onCancel={onCancel} okText="Save">
      <Form onFinish={onFinish} layout="vertical" className="mb-4">
        <Form.Item name="title" label="Task Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="company" label="Company" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="reminder" label="Reminder Date">
          <DatePicker showTime />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Add Task
        </Button>
      </Form>
    </Modal>
  )
}

export default AddTaskListModal
