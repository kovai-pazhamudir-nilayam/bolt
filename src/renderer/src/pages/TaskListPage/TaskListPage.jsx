import {
  Button,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Tag,
  Tooltip,
  Typography,
  theme as antTheme
} from 'antd'
import dayjs from 'dayjs'
import {
  Bell,
  CalendarDays,
  Edit2,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'

const { Text } = Typography

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = ['Not Picked', 'On Hold', 'In Progress', 'Done']

const STATUS_CONFIG = {
  'Not Picked': { color: '#595959', headerBg: '#f5f5f5' },
  'On Hold': { color: '#d48806', headerBg: '#fff7e6' },
  'In Progress': { color: '#0958d9', headerBg: '#e6f4ff' },
  Done: { color: '#389e0d', headerBg: '#f6ffed' }
}

const PRIORITY_CONFIG = {
  Low: { color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' },
  Medium: { color: '#d48806', bg: '#fffbe6', border: '#ffe58f' },
  High: { color: '#cf1322', bg: '#fff1f0', border: '#ffa39e' }
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// ─── Audio & Notifications ────────────────────────────────────────────────────

const TONES = {
  alert:  { label: '🔔 Alert',   freq: 440,  type: 'sine',     duration: 1.0, double: false },
  chime:  { label: '🎵 Chime',   freq: 880,  type: 'sine',     duration: 0.6, double: false },
  ding:   { label: '🔔 Ding Ding', freq: 660, type: 'sine',    duration: 0.4, double: true  },
  gentle: { label: '🌙 Gentle',  freq: 330,  type: 'sine',     duration: 1.5, double: false },
  buzz:   { label: '📳 Buzz',    freq: 180,  type: 'square',   duration: 0.4, double: true  },
  sharp:  { label: '⚡ Sharp',   freq: 1046, type: 'triangle', duration: 0.3, double: false }
}

const playTone = (toneKey = 'alert') => {
  const tone = TONES[toneKey] || TONES.alert
  const ctx = new (window.AudioContext || window.webkitAudioContext)()

  const beep = (startTime) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = tone.type
    osc.frequency.setValueAtTime(tone.freq, startTime)
    gain.gain.setValueAtTime(0.3, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + tone.duration)
    osc.start(startTime)
    osc.stop(startTime + tone.duration)
  }

  beep(ctx.currentTime)
  if (tone.double) beep(ctx.currentTime + tone.duration + 0.15)
}

const triggerReminder = (task) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`⏰ ${task.title}`, {
      body: [
        task.description ? task.description.slice(0, 80) : '',
        task.dueDate ? `Due ${dayjs(task.dueDate).format('MMM D')}` : ''
      ].filter(Boolean).join(' · ')
    })
  }
  playTone(task.reminder?.tone)
}

const pTagStyle = (priority) => {
  const p = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium
  return { color: p.color, background: p.bg, border: `1px solid ${p.border}`, margin: 0 }
}

// ─── TagInput ─────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  return (
    <div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {tags.map((t) => (
            <Tag
              key={t}
              closable
              onClose={() => onChange(tags.filter((x) => x !== t))}
              style={{ margin: 0 }}
            >
              {t}
            </Tag>
          ))}
        </div>
      )}
      <Input
        size="small"
        placeholder="Type a tag and press Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
        suffix={
          <Button type="link" size="small" onClick={add} style={{ padding: 0 }}>
            <Plus size={12} />
          </Button>
        }
      />
    </div>
  )
}

// ─── TaskForm ─────────────────────────────────────────────────────────────────

function TaskForm({ form, tags, onTagsChange, attachment, onAttachmentChange, tagError }) {
  const fileRef = useRef()

  return (
    <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Title is required' }]}
      >
        <Input placeholder="Task title" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Description is required' }]}
      >
        <Input.TextArea rows={3} placeholder="Describe the task…" />
      </Form.Item>

      <Form.Item
        name="dueDate"
        label="Due Date"
        rules={[{ required: true, message: 'Due date is required' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Tags"
        required
        validateStatus={tagError ? 'error' : ''}
        help={tagError ? 'At least one tag is required' : ''}
      >
        <TagInput
          tags={tags}
          onChange={(t) => {
            onTagsChange(t)
          }}
        />
      </Form.Item>

      <Form.Item name="priority" label="Priority" initialValue="Medium">
        <Segmented options={['Low', 'Medium', 'High']} block />
      </Form.Item>

      <Divider dashed style={{ margin: '4px 0 8px' }} />

      <div style={{ display: 'flex', gap: 12 }}>
        <Form.Item name="reminderDatetime" label="Reminder" style={{ flex: 1, marginBottom: 8 }}>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="Optional date & time"
          />
        </Form.Item>
        <Form.Item
          name="reminderType"
          label="Type"
          initialValue="Once"
          style={{ width: 100, marginBottom: 8 }}
        >
          <Select
            options={[
              { value: 'Once', label: 'Once' },
              { value: 'Daily', label: 'Daily' },
              { value: 'Custom', label: 'Custom' }
            ]}
          />
        </Form.Item>
        <Form.Item
          name="reminderTone"
          label="Tone"
          initialValue="alert"
          style={{ width: 140, marginBottom: 8 }}
        >
          <Select
            options={Object.entries(TONES).map(([value, { label }]) => ({ value, label }))}
            onChange={(val) => playTone(val)}
          />
        </Form.Item>
      </div>

      <Form.Item label="Attachment" style={{ marginBottom: 0 }}>
        <input
          ref={fileRef}
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files[0]
            if (f) onAttachmentChange({ name: f.name, size: f.size })
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            size="small"
            icon={<Paperclip size={13} />}
            onClick={() => fileRef.current.click()}
          >
            Choose File
          </Button>
          {attachment?.name && (
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              {attachment.name}
              <Button
                type="link"
                danger
                size="small"
                style={{ padding: 0 }}
                onClick={() => onAttachmentChange(null)}
              >
                <X size={12} />
              </Button>
            </span>
          )}
        </div>
      </Form.Item>
    </Form>
  )
}

// ─── TaskListPage ─────────────────────────────────────────────────────────────

function TaskListPage() {
  const { token } = antTheme.useToken()

  const [tasks, setTasks] = useState([])
  const [draggedId, setDraggedId] = useState(null)

  const db = window.kanbanTaskAPI?.kanbanTask

  useEffect(() => {
    db?.getAll().then((loaded) => { if (loaded) setTasks(loaded) })
  }, [])

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm] = Form.useForm()
  const [createTags, setCreateTags] = useState([])
  const [createAttachment, setCreateAttachment] = useState(null)
  const [createTagError, setCreateTagError] = useState(false)

  // Detail modal
  const [detailId, setDetailId] = useState(null)
  const [detailEditMode, setDetailEditMode] = useState(false)
  const [editForm] = Form.useForm()
  const [editTags, setEditTags] = useState([])
  const [editAttachment, setEditAttachment] = useState(null)
  const [editTagError, setEditTagError] = useState(false)
  const [commentText, setCommentText] = useState('')

  const detailTask = detailId ? tasks.find((t) => t.id === detailId) : null

  // ── Reminder interval ──────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (!task.reminder?.datetime || task.reminder.triggered) return task
          const diff = dayjs(task.reminder.datetime).diff(dayjs(), 'minute')
          if (diff >= 0 && diff <= 15) {
            triggerReminder(task)
            return { ...task, reminder: { ...task.reminder, triggered: true } }
          }
          return task
        })
      )
    }, 60000)
    return () => clearInterval(iv)
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const valuesAsTask = (values, tags, attachment) => ({
    title: values.title,
    description: values.description,
    dueDate: values.dueDate?.format('YYYY-MM-DD') || '',
    tags,
    priority: values.priority || 'Medium',
    reminder: values.reminderDatetime
      ? {
          datetime: values.reminderDatetime.toISOString(),
          type: values.reminderType || 'Once',
          tone: values.reminderTone || 'alert',
          triggered: false
        }
      : { datetime: '', type: 'Once', tone: 'alert', triggered: false },
    attachment: attachment || { name: '', size: 0 }
  })

  // ── Create ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    createForm.resetFields()
    setCreateTags([])
    setCreateAttachment(null)
    setCreateTagError(false)
    setCreateOpen(true)
  }

  const handleCreate = async () => {
    const values = await createForm.validateFields()
    if (!createTags.length) {
      setCreateTagError(true)
      return
    }
    setCreateTagError(false)
    const task = {
      id: genId(),
      status: 'Not Picked',
      comments: [],
      ...valuesAsTask(values, createTags, createAttachment)
    }
    setTasks((prev) => [...prev, task])
    db?.upsert(task)
    setCreateOpen(false)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  // ── Edit (inside detail modal) ─────────────────────────────────────────────
  const openDetailEdit = (task) => {
    setEditTags(task.tags)
    setEditAttachment(task.attachment?.name ? task.attachment : null)
    setEditTagError(false)
    editForm.setFieldsValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      priority: task.priority,
      reminderDatetime: task.reminder?.datetime ? dayjs(task.reminder.datetime) : null,
      reminderType: task.reminder?.type || 'Once',
      reminderTone: task.reminder?.tone || 'alert'
    })
    setDetailEditMode(true)
  }

  const handleEdit = async () => {
    if (!detailTask) return
    const values = await editForm.validateFields()
    if (!editTags.length) {
      setEditTagError(true)
      return
    }
    setEditTagError(false)
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== detailTask.id) return t
        const updated = { ...t, ...valuesAsTask(values, editTags, editAttachment) }
        db?.upsert(updated)
        return updated
      })
    )
    setDetailEditMode(false)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    db?.delete(id)
    setDetailId(null)
    setDetailEditMode(false)
  }

  // ── Comment ────────────────────────────────────────────────────────────────
  const addComment = () => {
    if (!commentText.trim() || !detailId) return
    const c = { id: genId(), text: commentText.trim(), timestamp: new Date().toISOString() }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== detailId) return t
        const updated = { ...t, comments: [...t.comments, c] }
        db?.upsert(updated)
        return updated
      })
    )
    setCommentText('')
  }

  // ── Reminder reset ─────────────────────────────────────────────────────────
  const resetReminder = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, reminder: { datetime: '', type: 'Once', triggered: false } } : t
      )
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Task Manager"
        description="Plan, manage, and complete tasks effortlessly."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
          New Task
        </Button>
      </div>

      {/* ── Kanban Board ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          overflowX: 'auto',
          paddingBottom: 8,
          alignItems: 'flex-start'
        }}
      >
        {STATUSES.map((status) => {
          const cfg = STATUS_CONFIG[status]
          const colTasks = tasks.filter((t) => t.status === status)

          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedId) {
                  setTasks((prev) => prev.map((t) => {
                    if (t.id !== draggedId) return t
                    const updated = { ...t, status }
                    db?.upsert(updated)
                    return updated
                  }))
                  setDraggedId(null)
                }
              }}
              style={{
                flex: '0 0 272px',
                minWidth: 272,
                borderRadius: 10,
                border: `1px solid ${token.colorBorderSecondary}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 280px)'
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: '9px 14px',
                  background: cfg.headerBg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                  borderBottom: `1px solid ${token.colorBorderSecondary}`
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 12, color: cfg.color, letterSpacing: 0.3 }}
                >
                  {status.toUpperCase()}
                </span>
                <Tag style={{ margin: 0, fontSize: 11 }}>{colTasks.length}</Tag>
              </div>

              {/* Cards */}
              <div
                style={{ padding: 10, overflowY: 'auto', flex: 1, background: token.colorBgLayout }}
              >
                {colTasks.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span style={{ fontSize: 12 }}>No tasks here</span>}
                    style={{ margin: '24px 0' }}
                  />
                ) : (
                  colTasks.map((task) => {
                    const isOverdue =
                      task.dueDate &&
                      dayjs(task.dueDate).isBefore(dayjs(), 'day') &&
                      task.status !== 'Done'

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedId(task.id)
                          setTimeout(() => {
                            e.target.style.opacity = '0.4'
                          }, 0)
                        }}
                        onDragEnd={(e) => {
                          e.target.style.opacity = '1'
                        }}
                        onClick={() => {
                          setDetailId(task.id)
                          setDetailEditMode(false)
                          setCommentText('')
                        }}
                        style={{
                          background: token.colorBgContainer,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          borderRadius: 8,
                          padding: '10px 12px',
                          marginBottom: 8,
                          cursor: 'grab',
                          userSelect: 'none',
                          transition: 'box-shadow 0.15s, border-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'
                          e.currentTarget.style.borderColor = token.colorPrimary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = token.colorBorderSecondary
                        }}
                      >
                        {/* Title */}
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            marginBottom: 8,
                            lineHeight: 1.4
                          }}
                        >
                          {task.title}
                        </div>

                        {/* Badges row */}
                        <div
                          style={{
                            display: 'flex',
                            gap: 4,
                            flexWrap: 'wrap',
                            marginBottom: task.tags.length ? 6 : 0
                          }}
                        >
                          {task.dueDate && (
                            <Tag
                              color={isOverdue ? 'red' : 'default'}
                              style={{ fontSize: 11, margin: 0 }}
                            >
                              <CalendarDays
                                size={10}
                                style={{ marginRight: 3, verticalAlign: 'middle' }}
                              />
                              {dayjs(task.dueDate).format('MMM D')}
                            </Tag>
                          )}
                          <Tag style={{ ...pTagStyle(task.priority), fontSize: 11 }}>
                            {task.priority}
                          </Tag>
                          {task.reminder?.datetime && !task.reminder.triggered && (
                            <Tooltip
                              title={`Reminder: ${dayjs(task.reminder.datetime).format('MMM D HH:mm')}`}
                            >
                              <Tag
                                color="purple"
                                style={{ fontSize: 11, margin: 0, padding: '0 5px' }}
                              >
                                <Bell size={10} />
                              </Tag>
                            </Tooltip>
                          )}
                          {task.attachment?.name && (
                            <Tooltip title={task.attachment.name}>
                              <Tag style={{ fontSize: 11, margin: 0, padding: '0 5px' }}>
                                <Paperclip size={10} />
                              </Tag>
                            </Tooltip>
                          )}
                        </div>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {task.tags.map((t) => (
                              <Tag
                                key={t}
                                color="blue"
                                style={{ fontSize: 10, padding: '0 5px', margin: 0 }}
                              >
                                {t}
                              </Tag>
                            ))}
                          </div>
                        )}

                        {/* Comment count */}
                        {task.comments.length > 0 && (
                          <div
                            style={{
                              marginTop: 6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              color: token.colorTextTertiary,
                              fontSize: 11
                            }}
                          >
                            <MessageSquare size={11} />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Create Modal ──────────────────────────────────────────────────── */}
      <Modal
        title="New Task"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Create Task"
        width={580}
        destroyOnClose
      >
        <TaskForm
          form={createForm}
          tags={createTags}
          onTagsChange={(t) => {
            setCreateTags(t)
            if (t.length) setCreateTagError(false)
          }}
          attachment={createAttachment}
          onAttachmentChange={setCreateAttachment}
          tagError={createTagError}
        />
      </Modal>

      {/* ── Detail / Edit Modal ───────────────────────────────────────────── */}
      {detailTask && (
        <Modal
          open={!!detailId}
          onCancel={() => {
            setDetailId(null)
            setDetailEditMode(false)
          }}
          footer={null}
          width={640}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>{detailTask.title}</span>
              <Tag style={{ ...pTagStyle(detailTask.priority), fontSize: 11 }}>
                {detailTask.priority}
              </Tag>
              <Tag style={{ color: STATUS_CONFIG[detailTask.status].color, fontSize: 11 }}>
                {detailTask.status}
              </Tag>
            </div>
          }
          destroyOnClose
        >
          {detailEditMode ? (
            <>
              <TaskForm
                form={editForm}
                tags={editTags}
                onTagsChange={(t) => {
                  setEditTags(t)
                  if (t.length) setEditTagError(false)
                }}
                attachment={editAttachment}
                onAttachmentChange={setEditAttachment}
                tagError={editTagError}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <Button onClick={() => setDetailEditMode(false)}>Cancel</Button>
                <Button type="primary" onClick={handleEdit}>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Description */}
              <div style={{ marginBottom: 14 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Description
                </Text>
                <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                  {detailTask.description}
                </p>
              </div>

              {/* Due date */}
              {detailTask.dueDate && (
                <div style={{ marginBottom: 14 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Due Date
                  </Text>
                  <p style={{ margin: '4px 0 0' }}>
                    <CalendarDays size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                    {dayjs(detailTask.dueDate).format('MMM D, YYYY')}
                  </p>
                </div>
              )}

              {/* Tags */}
              {detailTask.tags.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tags
                  </Text>
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {detailTask.tags.map((t) => (
                      <Tag key={t} color="blue">
                        {t}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder */}
              {detailTask.reminder?.datetime && (
                <div style={{ marginBottom: 14 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Reminder
                  </Text>
                  <div
                    style={{
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Bell size={13} />
                    <span style={{ fontSize: 13 }}>
                      {dayjs(detailTask.reminder.datetime).format('MMM D, YYYY HH:mm')}
                      {' · '}
                      {detailTask.reminder.type}
                    </span>
                    {detailTask.reminder.triggered && <Tag color="green">Triggered</Tag>}
                    <Button
                      size="small"
                      icon={<RefreshCw size={12} />}
                      onClick={() => resetReminder(detailTask.id)}
                    >
                      Reset Reminder
                    </Button>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {detailTask.attachment?.name && (
                <div style={{ marginBottom: 14 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Attachment
                  </Text>
                  <p
                    style={{
                      margin: '4px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 13
                    }}
                  >
                    <Paperclip size={13} />
                    {detailTask.attachment.name}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div
                style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, margin: '4px 0 8px' }}
              >
                <Button icon={<Edit2 size={14} />} onClick={() => openDetailEdit(detailTask)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this task?"
                  description="This action cannot be undone."
                  onConfirm={() => deleteTask(detailTask.id)}
                  okType="danger"
                  okText="Delete"
                >
                  <Button danger icon={<Trash2 size={14} />}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>

              <Divider style={{ margin: '8px 0 14px' }} />

              {/* Comments */}
              <div>
                <Text strong style={{ fontSize: 13 }}>
                  <MessageSquare size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Comments ({detailTask.comments.length})
                </Text>

                <div style={{ marginTop: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {detailTask.comments.length === 0 ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      No comments yet.
                    </Text>
                  ) : (
                    detailTask.comments.map((c) => (
                      <div key={c.id} style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 2
                          }}
                        >
                          <Text strong style={{ fontSize: 12 }}>
                            You
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {dayjs(c.timestamp).format('MMM D, HH:mm')}
                          </Text>
                        </div>
                        <div
                          style={{
                            background: token.colorFillTertiary,
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 13,
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {c.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: 10 }}>
                  <Input.TextArea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment… (Enter to submit, Shift+Enter for new line)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        addComment()
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    size="small"
                    style={{ marginTop: 6 }}
                    disabled={!commentText.trim()}
                    onClick={addComment}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}

export default TaskListPage
