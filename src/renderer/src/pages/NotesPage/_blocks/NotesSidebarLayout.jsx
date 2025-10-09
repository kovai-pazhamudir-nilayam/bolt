import { Button, Input, Select, Space, Tag, Typography, Popconfirm } from 'antd'
import { Calendar, Clock, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import withNotification from '../../../hoc/withNotification'
import { notesFactory } from '../../../repos/NotesPage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import './NotesSidebarLayout.less'

const { Text, Title } = Typography
const { notesRepo } = notesFactory()
const { companyRepo } = settingsFactory()

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

const NotesSidebarLayoutWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [editingTitle, setEditingTitle] = useState('')
  const [editingCompany, setEditingCompany] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteCompany, setNewNoteCompany] = useState('')
  const [companies, setCompanies] = useState([])
  const contentEditableRef = useRef(null)
  const hasUnsavedChangesRef = useRef(null)

  const loadData = useCallback(async () => {
    try {
      const [data, companiesData] = await Promise.all([notesRepo.getAll(), companyRepo.getAll()])
      setNotes(data)
      setCompanies(companiesData)

      // Select first note if none selected
      if (!selectedNote && data.length > 0) {
        setSelectedNote(data[0])
        setEditingTitle(data[0].title || '')
        setEditingContent(data[0].content || '')
      }
    } catch (error) {
      renderErrorNotification(error)
    }
  }, [selectedNote, renderErrorNotification])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Update contentEditable when editingContent changes
  useEffect(() => {
    if (contentEditableRef.current && editingContent !== contentEditableRef.current.textContent) {
      contentEditableRef.current.textContent = editingContent
    }
  }, [editingContent])

  // Group notes by time periods
  const groupedNotes = useMemo(() => {
    return getGrouppedNotes(notes)
  }, [notes])

  const handleNoteSelect = (note) => {
    // Save current note if there are unsaved changes
    if (selectedNote && hasUnsavedChangesRef.current) {
      handleAutoSave()
    }

    setSelectedNote(note)
    setEditingTitle(note.title || '')
    setEditingContent(note.content || '') // Load the actual content  
    setEditingCompany(note.company_code || '')
    setHasUnsavedChanges(false)
    hasUnsavedChangesRef.current = false
  }

  const handleContentChange = (value) => {
    setEditingContent(value)
    setHasUnsavedChanges(true)
    hasUnsavedChangesRef.current = true
  }

  const handleTitleChange = (value) => {
    setEditingTitle(value)
    setHasUnsavedChanges(true)
    hasUnsavedChangesRef.current = true
  }

  const handleCompanyChange = (value) => {
    setEditingCompany(value)
    setHasUnsavedChanges(true)
    hasUnsavedChangesRef.current = true
  }

  const handleFocusOut = () => {
    if (hasUnsavedChangesRef.current) {
      handleAutoSave()
    }
  }

  const handleAutoSave = async () => {
    if (!selectedNote || !hasUnsavedChangesRef.current) return

    try {
      const updatedNote = await notesRepo.upsert({
        ...selectedNote,
        title: editingTitle,
        content: editingContent,
        company_code: editingCompany
      })

      setNotes((prev) => prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
      setSelectedNote(updatedNote)
      setHasUnsavedChanges(false)
      hasUnsavedChangesRef.current = false
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setNewNoteTitle('')
    setNewNoteCompany('')
    setEditingContent('')
    setEditingTitle('')
    setEditingCompany('')
    setSelectedNote(null)
    setHasUnsavedChanges(false)
  }

  const handleSaveNewNote = async () => {
    if (!newNoteTitle.trim()) return

    try {
      const newNote = await notesRepo.upsert({
        title: newNoteTitle,
        content: editingContent,
        company_code: newNoteCompany || null
      })

      setNotes((prev) => [newNote, ...prev])
      setSelectedNote(newNote)
      setEditingTitle(newNoteTitle)
      setIsCreatingNew(false)
      setHasUnsavedChanges(false)

      renderSuccessNotification({
        message: 'Note created successfully!'
      })
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const handleCancelNewNote = () => {
    setIsCreatingNew(false)
    setNewNoteTitle('')
    setNewNoteCompany('')
    setEditingContent('')
    setEditingTitle('')
    setEditingCompany('')
    setHasUnsavedChanges(false)
  }

  const handleDeleteNote = async (note) => {
    try {
      await notesRepo.delete(note.id)
      setNotes((prev) => prev.filter((n) => n.id !== note.id))

      // If the deleted note was selected, clear selection
      if (selectedNote?.id === note.id) {
        setSelectedNote(null)
        setEditingTitle('')
        setEditingContent('')
        setEditingCompany('')
        setHasUnsavedChanges(false)
      }

      renderSuccessNotification({
        message: 'Note deleted successfully!'
      })
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getNotePreview = (content) => {
    if (!content) return 'No content'
    const textContent = content.replace(/\n/g, ' ').substring(0, 50)
    return textContent + (content.length > 50 ? '...' : '')
  }

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
    <div className="notes-sidebar-layout">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Header */}
        <div className="header">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="title-container">
              <Title level={3} className="title">
                Notes
              </Title>
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={handleCreateNew}
                size="small"
              >
                New
              </Button>
            </div>

            <Input
              placeholder="Search notes..."
              prefix={<Search size={14} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
          </Space>
        </div>

        {/* Notes List */}
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
                    onClick={() => handleNoteSelect(note)}
                    className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                  >
                    <Popconfirm
                      title="Delete Note"
                      description={`Are you sure you want to delete "${note.title || 'Untitled'}"? This action cannot be undone.`}
                      onConfirm={() => handleDeleteNote(note)}
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
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {isCreatingNew ? (
          <>
            {/* New Note Header */}
            <div className="content-header">
              <div className="header-content">
                <div className="note-info">
                  <Input
                    placeholder="Enter note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="new-note-title-input"
                  />
                  <div className="note-meta">
                    <Select
                      placeholder="Company (optional)"
                      value={newNoteCompany}
                      onChange={setNewNoteCompany}
                      options={companies.map((c) => ({
                        label: `${c.company_code} - ${c.company_name}`,
                        value: c.company_code
                      }))}
                      className="new-note-company-select"
                      allowClear
                    />
                  </div>
                </div>

                <div className="actions">
                  <Space>
                    <Button
                      type="primary"
                      onClick={handleSaveNewNote}
                      disabled={!newNoteTitle.trim()}
                    >
                      Save
                    </Button>
                    <Button onClick={handleCancelNewNote}>Cancel</Button>
                  </Space>
                </div>
              </div>
            </div>

            {/* New Note Content */}
            <div className="content-area">
              <div
                ref={contentEditableRef}
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) => setEditingContent(e.target.textContent)}
                onBlur={handleFocusOut}
                className="contenteditable-area"
                placeholder="Start typing your note..."
              />
            </div>
          </>
        ) : selectedNote ? (
          <>
            {/* Header */}
            <div className="content-header">
              <div className="header-content">
                <div className="note-info">
                  <Input
                    value={editingTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onBlur={handleFocusOut}
                    placeholder="Enter note title..."
                    className="editable-title-input"
                  />
                  <div className="note-meta">
                    <Text className="date">{formatDate(selectedNote.created_at)}</Text>
                    <div className="editable-meta">
                      <Select
                        value={editingCompany}
                        onChange={handleCompanyChange}
                        onBlur={handleFocusOut}
                        placeholder="Company (optional)"
                        options={companies.map((c) => ({
                          label: `${c.company_code} - ${c.company_name}`,
                          value: c.company_code
                        }))}
                        className="editable-company-select"
                        allowClear
                      />
                    </div>
                  </div>
                </div>

                <div className="actions">
                  {hasUnsavedChanges && <Text className="auto-save-indicator">Saving...</Text>}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="content-area">
              <div
                ref={contentEditableRef}
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) => handleContentChange(e.target.textContent)}
                onBlur={handleFocusOut}
                className="contenteditable-area"
                placeholder="Start typing your note..."
              />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <Title level={3} className="empty-title">
                No Note Selected
              </Title>
              <Text>Select a note from the sidebar to view its content</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const NotesSidebarLayout = withNotification(NotesSidebarLayoutWOC)

export default NotesSidebarLayout
