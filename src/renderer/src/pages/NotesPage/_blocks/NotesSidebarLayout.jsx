import { useCallback, useEffect, useRef, useState } from 'react'
import withNotification from '../../../hoc/withNotification'
import { notesFactory } from '../../../repos/NotesPage.repo'
import { settingsFactory } from '../../../repos/SettingsPage.repo'
import PageHeader from '../../../components/PageHeader/PageHeader'
import EmptyNotes from './EmptyNotes'
import NoteEditor from './NoteEditor'
import NotesList from './NotesList'
import NotesSidebarHeader from './NotesSidebarHeader'
import './NotesSidebarLayout.less'

const { notesRepo } = notesFactory()
const { companyRepo } = settingsFactory()

const initialEditingState = {
  title: '',
  content: '',
  company: '',
  hasUnsavedChanges: false
}

const NotesSidebarLayoutWOC = ({ renderSuccessNotification }) => {
  const [notes, setNotes] = useState([])
  const [companies, setCompanies] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState(null)
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [editingState, setEditingState] = useState(initialEditingState)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved'
  const [loading, setLoading] = useState(true)

  // Refs to avoid stale closures
  const hasUnsavedChangesRef = useRef(false)
  const editingStateRef = useRef(initialEditingState)
  const selectedNoteRef = useRef(null)
  const saveTimerRef = useRef(null)

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null
  selectedNoteRef.current = selectedNote

  const loadData = async () => {
    setLoading(true)
    const [data, companiesData] = await Promise.all([notesRepo.getAll(), companyRepo.getAll()])
    setNotes(data || [])
    setCompanies(companiesData || [])
    if (data && data.length > 0) {
      setSelectedNoteId(data[0].id)
      const state = {
        title: data[0].title || '',
        content: data[0].content || '',
        company: data[0].company_code || '',
        hasUnsavedChanges: false
      }
      setEditingState(state)
      editingStateRef.current = state
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Keyboard shortcut Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (isCreatingNew) {
          if (editingStateRef.current.title.trim()) handleSaveNewNote()
        } else if (hasUnsavedChangesRef.current) {
          handleAutoSave()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCreatingNew])

  const updateEditingState = (partial) => {
    setEditingState((prev) => {
      const next = { ...prev, ...partial }
      editingStateRef.current = next
      return next
    })
  }

  const handleContentChange = (value) => {
    updateEditingState({ content: value, hasUnsavedChanges: true })
    hasUnsavedChangesRef.current = true
  }

  const handleTitleChange = (value) => {
    updateEditingState({ title: value, hasUnsavedChanges: true })
    hasUnsavedChangesRef.current = true
  }

  const handleCompanyChange = (value) => {
    updateEditingState({ company: value, hasUnsavedChanges: true })
    hasUnsavedChangesRef.current = true
  }

  const handleAutoSave = useCallback(async () => {
    const note = selectedNoteRef.current
    if (!note || !hasUnsavedChangesRef.current) return

    const current = editingStateRef.current
    hasUnsavedChangesRef.current = false

    clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')

    const updatedNote = await notesRepo.upsert({
      ...note,
      title: current.title,
      content: current.content,
      company_code: current.company
    })

    setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)))
    updateEditingState({ hasUnsavedChanges: false })
    setSaveStatus('saved')

    saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
  }, [])

  const handleFocusOut = () => {
    if (hasUnsavedChangesRef.current) handleAutoSave()
  }

  const handleNoteSelect = async (note) => {
    if (note.id === selectedNoteId) return
    if (selectedNoteRef.current && hasUnsavedChangesRef.current) {
      await handleAutoSave()
    }
    setSelectedNoteId(note.id)
    const state = {
      title: note.title || '',
      content: note.content || '',
      company: note.company_code || '',
      hasUnsavedChanges: false
    }
    setEditingState(state)
    editingStateRef.current = state
    hasUnsavedChangesRef.current = false
    setSaveStatus('idle')
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setSelectedNoteId(null)
    const state = { title: '', content: '', company: '', hasUnsavedChanges: false }
    setEditingState(state)
    editingStateRef.current = state
    hasUnsavedChangesRef.current = false
    setSaveStatus('idle')
  }

  const handleSaveNewNote = async () => {
    const current = editingStateRef.current
    if (!current.title.trim()) return
    const newNote = await notesRepo.upsert({
      title: current.title,
      content: current.content,
      company_code: current.company || null
    })
    setNotes((prev) => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
    setIsCreatingNew(false)
    updateEditingState({ hasUnsavedChanges: false })
    hasUnsavedChangesRef.current = false
    renderSuccessNotification({ message: 'Note created!' })
  }

  const handleCancelNewNote = () => {
    setIsCreatingNew(false)
    const state = initialEditingState
    setEditingState(state)
    editingStateRef.current = state
    hasUnsavedChangesRef.current = false
  }

  const handleDeleteNote = async (note) => {
    await notesRepo.delete(note.id)
    const remaining = notes.filter((n) => n.id !== note.id)
    setNotes(remaining)

    if (selectedNoteId === note.id) {
      const next = remaining[0] || null
      if (next) {
        setSelectedNoteId(next.id)
        const state = {
          title: next.title || '',
          content: next.content || '',
          company: next.company_code || '',
          hasUnsavedChanges: false
        }
        setEditingState(state)
        editingStateRef.current = state
      } else {
        setSelectedNoteId(null)
        setEditingState(initialEditingState)
        editingStateRef.current = initialEditingState
      }
      hasUnsavedChangesRef.current = false
      setSaveStatus('idle')
    }

    renderSuccessNotification({ message: 'Note deleted' })
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Capture your thoughts, ideas, and important information in one organized place."
      />
      <div className="notes-sidebar-layout">
        <div className="sidebar">
          <NotesSidebarHeader
            searchText={searchText}
            onSearchChange={setSearchText}
            onCreateNew={handleCreateNew}
            companies={companies}
            selectedCompanyFilter={selectedCompanyFilter}
            onCompanyFilterChange={setSelectedCompanyFilter}
            noteCount={notes.length}
          />
          <NotesList
            notes={notes}
            searchText={searchText}
            selectedCompanyFilter={selectedCompanyFilter}
            selectedNote={selectedNote}
            onNoteSelect={handleNoteSelect}
            onDeleteNote={handleDeleteNote}
            loading={loading}
          />
        </div>

        <div className="main-content">
          {isCreatingNew || selectedNote ? (
            <NoteEditor
              isCreatingNew={isCreatingNew}
              selectedNote={selectedNote}
              editingState={editingState}
              companies={companies}
              saveStatus={saveStatus}
              onTitleChange={handleTitleChange}
              onCompanyChange={handleCompanyChange}
              onContentChange={handleContentChange}
              onFocusOut={handleFocusOut}
              onSaveNewNote={handleSaveNewNote}
              onCancelNewNote={handleCancelNewNote}
            />
          ) : (
            <EmptyNotes onCreateNew={handleCreateNew} />
          )}
        </div>
      </div>
    </div>
  )
}

const NotesSidebarLayout = withNotification(NotesSidebarLayoutWOC)

export default NotesSidebarLayout
