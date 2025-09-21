// TaskPage.jsx
import { Button, Card, Col, Row, Segmented, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import { tasksFactory } from '../../repos/taskPage.repo'
import { Plus } from 'lucide-react'
import AddTaskListModal from './_blocks/AddTaskListModal'

const { taskRepo } = tasksFactory()

const statusColors = {
  pending: 'blue',
  in_progress: 'orange',
  completed: 'green'
}

function TaskListPage() {
  const [tasks, setTasks] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [viewMode, setViewMode] = useState('card') // "table" | "card"

  const fetchTasks = async () => {
    const list = await taskRepo.getAll()
    setTasks(list)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const updateStatus = async (taskId, status) => {
    await taskRepo.update(taskId, status)
    fetchTasks()
  }

  return (
    <div>
      <PageHeader
        title="Task Manager"
        description="Your workspace to plan, manage, and complete tasks effortlessly."
      />

      {isModalVisible && <AddTaskListModal onCancel={() => setIsModalVisible(false)} />}

      <Row justify={'space-between'}>
        <Col>
          <Segmented
            options={[
              { label: 'Table View', value: 'table' },
              { label: 'Card View', value: 'card' }
            ]}
            value={viewMode}
            onChange={setViewMode}
            style={{ marginBottom: 16 }}
          />
        </Col>
        <Col>
          <Button icon={<Plus size={16} />} type="primary" onClick={() => setIsModalVisible(true)}>
            Add New Task
          </Button>
        </Col>
      </Row>

      {/* Table Layout */}
      {viewMode === 'table' && (
        <Table
          rowKey="id"
          dataSource={tasks}
          columns={[
            { title: 'Title', dataIndex: 'title' },
            { title: 'Company', dataIndex: 'company_code' },
            {
              title: 'Reminder',
              dataIndex: 'reminder_at',
              render: (val) => val && dayjs(val).format('YYYY-MM-DD HH:mm')
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (val) => <Tag color={statusColors[val]}>{val}</Tag>
            },
            {
              title: 'Actions',
              render: (_, task) => (
                <Space>
                  {task.status !== 'in_progress' && (
                    <Button size="small" onClick={() => updateStatus(task.id, 'in_progress')}>
                      Mark In Progress
                    </Button>
                  )}
                  {task.status !== 'completed' && (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => updateStatus(task.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                </Space>
              )
            }
          ]}
        />
      )}

      {/* Card Layout */}
      {viewMode === 'card' && (
        <Row gutter={[16, 16]}>
          {tasks.map((task) => (
            <Col xs={24} sm={12} md={8} lg={6} key={task.id}>
              <Card
                title={task.title}
                extra={<Tag color={statusColors[task.status]}>{task.status}</Tag>}
                actions={[
                  task.status !== 'in_progress' && (
                    <Button size="small" onClick={() => updateStatus(task.id, 'in_progress')}>
                      In Progress
                    </Button>
                  ),
                  task.status !== 'completed' && (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => updateStatus(task.id, 'completed')}
                    >
                      Complete
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <p>
                  <b>Company:</b> {task.company_code}
                </p>
                {task.description && <p>{task.description}</p>}
                {task.reminder_at && (
                  <p>
                    <b>Reminder:</b> {dayjs(task.reminder_at).format('YYYY-MM-DD HH:mm')}
                  </p>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default TaskListPage
