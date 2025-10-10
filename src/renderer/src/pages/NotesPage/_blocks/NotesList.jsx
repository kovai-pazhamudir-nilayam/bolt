import { Button, Tag, Typography, Popconfirm } from 'antd'
import { Calendar, Clock, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

const { Text } = Typography

const getGrouppedNotes = (notes) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 30 Days': [],
    Older: []
  }

  notes.forEach((note) => {
    const noteDate = new Date(note.created_at)
    const noteDateOnly = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate())

    if (noteDateOnly.getTime() === today.getTime()) {
      groups['Today'].push(note)
    } else if (noteDateOnly.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(note)
    } else if (noteDate.getTime() >= thirtyDaysAgo.getTime()) {
      groups['Previous 30 Days'].push(note)
    } else {
      groups['Older'].push(note)
    }
  })

  // Sort notes within each group by creation date (newest first)
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  return groups
}

const getNotePreview = (content) => {
  if (!content) return 'No content'
  const textContent = content.replace(/\n/g, ' ').substring(0, 50)
  return textContent + (content.length > 50 ? '...' : '')
}

const NotesList = ({ notes, searchText, selectedNote, onNoteSelect, onDeleteNote }) => {
  // Group notes by time periods
  const groupedNotes = useMemo(() => {
    return getGrouppedNotes(notes)
  }, [notes])

  const filteredGroups = useMemo(() => {
    if (!searchText.trim()) return groupedNotes

    const filtered = {}
    Object.keys(groupedNotes).forEach((key) => {
      filtered[key] = groupedNotes[key].filter(
        (note) =>
          note.title.toLowerCase().includes(searchText.toLowerCase()) ||
          note.content.toLowerCase().includes(searchText.toLowerCase()) ||
          (note.company_code && note.company_code.toLowerCase().includes(searchText.toLowerCase()))
      )
    })

    return filtered
  }, [groupedNotes, searchText])

  return (
    <div className="notes-list">
      {Object.entries(filteredGroups).map(([period, periodNotes]) => {
        if (periodNotes.length === 0) return null

        return (
          <div key={period} className="time-group">
            <div className="group-header">
              <Calendar size={12} className="calendar-icon" />
              {period}
            </div>

            {periodNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onNoteSelect(note)}
                className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
              >
                <Popconfirm
                  title="Delete Note"
                  description={`Are you sure you want to delete "${note.title || 'Untitled'}"? This action cannot be undone.`}
                  onConfirm={() => onDeleteNote(note)}
                  okText="Delete"
                  cancelText="Cancel"
                  okType="danger"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={12} />}
                    className="delete-btn"
                    danger
                  />
                </Popconfirm>

                <div className="note-content">
                  <Text className="note-title">{note.title || 'Untitled'}</Text>
                  <Text className="note-preview">{getNotePreview(note.content)}</Text>
                </div>

                <div className="note-meta">
                  <div className="tags">
                    {note.company_code && (
                      <Tag size="small" color="purple" className="tag">
                        {note.company_code}
                      </Tag>
                    )}
                  </div>
                  <Text className="date">
                    <Clock size={10} className="clock-icon" />
                    {new Date(note.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default NotesList
