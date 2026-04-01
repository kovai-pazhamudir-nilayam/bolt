import { Button, Popconfirm, Spin, Tag, Typography } from 'antd'
import { Calendar, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

const { Text } = Typography

const getGroupedNotes = (notes) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const groups = { Today: [], Yesterday: [], 'Previous 30 Days': [], Older: [] }

  notes.forEach((note) => {
    const noteDate = new Date(note.created_at)
    const noteDateOnly = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate())

    if (noteDateOnly.getTime() === today.getTime()) groups['Today'].push(note)
    else if (noteDateOnly.getTime() === yesterday.getTime()) groups['Yesterday'].push(note)
    else if (noteDate.getTime() >= thirtyDaysAgo.getTime()) groups['Previous 30 Days'].push(note)
    else groups['Older'].push(note)
  })

  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
  })

  return groups
}

const getNotePreview = (content) => {
  if (!content) return ''
  const plainText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plainText.substring(0, 90) + (plainText.length > 90 ? '...' : '')
}

const formatNoteTime = (dateString, group) => {
  const date = new Date(dateString)
  if (group === 'Today' || group === 'Yesterday') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const NotesList = ({
  notes,
  searchText,
  selectedCompanyFilter,
  selectedNote,
  onNoteSelect,
  onDeleteNote,
  loading
}) => {
  const groupedNotes = useMemo(() => getGroupedNotes(notes), [notes])

  const filteredGroups = useMemo(() => {
    let filtered = groupedNotes

    if (selectedCompanyFilter) {
      const result = {}
      Object.keys(filtered).forEach((key) => {
        result[key] = filtered[key].filter((n) => n.company_code === selectedCompanyFilter)
      })
      filtered = result
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      const result = {}
      Object.keys(filtered).forEach((key) => {
        result[key] = filtered[key].filter(
          (n) =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.content || '').toLowerCase().includes(q) ||
            (n.company_code || '').toLowerCase().includes(q)
        )
      })
      filtered = result
    }

    return filtered
  }, [groupedNotes, searchText, selectedCompanyFilter])

  if (loading) {
    return (
      <div className="notes-list-loading">
        <Spin size="small" />
      </div>
    )
  }

  const hasAnyNotes = Object.values(filteredGroups).some((g) => g.length > 0)
  if (!hasAnyNotes) {
    return (
      <div className="notes-list-empty">
        <Text type="secondary">{searchText || selectedCompanyFilter ? 'No matching notes' : 'No notes yet'}</Text>
      </div>
    )
  }

  return (
    <div className="notes-list">
      {Object.entries(filteredGroups).map(([period, periodNotes]) => {
        if (periodNotes.length === 0) return null
        return (
          <div key={period} className="time-group">
            <div className="group-header">
              <Calendar size={11} />
              <span>{period}</span>
              <span className="group-count">{periodNotes.length}</span>
            </div>

            {periodNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onNoteSelect(note)}
                className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
              >
                <div className="note-item-body">
                  <div className="note-title-row">
                    <Text className="note-title">{note.title || 'Untitled'}</Text>
                    <Text className="note-time">{formatNoteTime(note.updated_at || note.created_at, period)}</Text>
                  </div>
                  {getNotePreview(note.content) && (
                    <Text className="note-preview">{getNotePreview(note.content)}</Text>
                  )}
                  {note.company_code && (
                    <Tag bordered={false} color="purple" className="note-tag">
                      {note.company_code}
                    </Tag>
                  )}
                </div>

                <Popconfirm
                  title="Delete this note?"
                  description="This cannot be undone."
                  onConfirm={(e) => { e.stopPropagation(); onDeleteNote(note) }}
                  onCancel={(e) => e.stopPropagation()}
                  okText="Delete"
                  cancelText="Cancel"
                  okType="danger"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={13} />}
                    className="delete-btn"
                    danger
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default NotesList
