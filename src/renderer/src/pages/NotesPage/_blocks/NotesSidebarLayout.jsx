import { useEffect, useRef, useState } from 'react'
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

const NotesSidebarLayoutWOC = ({ renderErrorNotification, renderSuccessNotification }) => {
  // Core data states
  const [notes, setNotes] = useState([])
  const [companies, setCompanies] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState(null)

  // UI state
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const initialEditingState = {
    title: '',
    content: '',
    company: '',
    hasUnsavedChanges: false
  }

  // Editing state - consolidated into a single object
  const [editingState, setEditingState] = useState(initialEditingState)

  // Refs
  const contentEditableRef = useRef(null)
  const hasUnsavedChangesRef = useRef(false)

  // Derived state
  const selectedNote = notes.find((note) => note.id === selectedNoteId)

  const loadData = async () => {
    try {
      const [data, companiesData] = await Promise.all([notesRepo.getAll(), companyRepo.getAll()])
      setNotes(data)
      setCompanies(companiesData)

      // Select first note if none selected
      if (!selectedNoteId && data.length > 0) {
        setSelectedNoteId(data[0].id)
        setEditingState({
          title: data[0].title || '',
          content: data[0].content || '',
          company: data[0].company_code || '',
          hasUnsavedChanges: false
        })
      }
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNoteSelect = (note) => {
    // Save current note if there are unsaved changes
    if (selectedNote && hasUnsavedChangesRef.current) {
      handleAutoSave()
    }
    setSelectedNoteId(note.id)
    setEditingState({
      title: note.title || '',
      content: note.content || '',
      company: note.company_code || '',
      hasUnsavedChanges: false
    })
    hasUnsavedChangesRef.current = false
  }

  const handleContentChange = (value) => {
    setEditingState((prev) => ({
      ...prev,
      content: value,
      hasUnsavedChanges: true
    }))
    hasUnsavedChangesRef.current = true
  }

  const handleTitleChange = (value) => {
    setEditingState((prev) => ({
      ...prev,
      title: value,
      hasUnsavedChanges: true
    }))
    hasUnsavedChangesRef.current = true
  }

  const handleCompanyChange = (value) => {
    setEditingState((prev) => ({
      ...prev,
      company: value,
      hasUnsavedChanges: true
    }))
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
        title: editingState.title,
        content: editingState.content,
        company_code: editingState.company
      })
      setNotes((prev) => prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
      setEditingState((prev) => ({
        ...prev,
        hasUnsavedChanges: false
      }))
      hasUnsavedChangesRef.current = false
    } catch (error) {
      renderErrorNotification(error)
    }
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setSelectedNoteId(null)
    setEditingState({
      title: '',
      content: '',
      company: '',
      hasUnsavedChanges: false
    })
  }

  const handleSaveNewNote = async () => {
    if (!editingState.title.trim()) return
    try {
      const newNote = await notesRepo.upsert({
        title: editingState.title,
        content: editingState.content,
        company_code: editingState.company || null
      })
      setNotes((prev) => [newNote, ...prev])
      setSelectedNoteId(newNote.id)
      setIsCreatingNew(false)
      setEditingState((prev) => ({
        ...prev,
        hasUnsavedChanges: false
      }))
      renderSuccessNotification({
        message: 'Note created successfully!'
      })
    } catch (error) {
      renderErrorNotification({
        message: error.message
      })
    }
  }

  const handleCancelNewNote = () => {
    setIsCreatingNew(false)
    setEditingState(initialEditingState)
  }

  const handleDeleteNote = async (note) => {
    try {
      await notesRepo.delete(note.id)
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
      // If the deleted note was selected, clear selection
      if (selectedNoteId === note.id) {
        setSelectedNoteId(null)
        setEditingState({
          title: '',
          content: '',
          company: '',
          hasUnsavedChanges: false
        })
      }
      renderSuccessNotification({
        message: 'Note deleted successfully!'
      })
    } catch (error) {
      renderErrorNotification({
        message: error.message
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Capture your thoughts, ideas, and important information in one organized place."
      />

      <div className="notes-sidebar-layout">
        {/* Sidebar */}
        <div className="sidebar">
          {/* Header */}
          <NotesSidebarHeader
            searchText={searchText}
            onSearchChange={setSearchText}
            onCreateNew={handleCreateNew}
            companies={companies}
            selectedCompanyFilter={selectedCompanyFilter}
            onCompanyFilterChange={setSelectedCompanyFilter}
          />

          {/* Notes List */}
          <NotesList
            notes={notes}
            searchText={searchText}
            selectedCompanyFilter={selectedCompanyFilter}
            selectedNote={selectedNote}
            onNoteSelect={handleNoteSelect}
            onDeleteNote={handleDeleteNote}
          />
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {isCreatingNew || selectedNote ? (
            <NoteEditor
              isCreatingNew={isCreatingNew}
              selectedNote={selectedNote}
              editingState={editingState}
              companies={companies}
              contentEditableRef={contentEditableRef}
              onTitleChange={handleTitleChange}
              onCompanyChange={handleCompanyChange}
              onContentChange={handleContentChange}
              onFocusOut={handleFocusOut}
              onSaveNewNote={handleSaveNewNote}
              onCancelNewNote={handleCancelNewNote}
            />
          ) : (
            <EmptyNotes />
          )}
        </div>
      </div>
    </div>
  )
}

const NotesSidebarLayout = withNotification(NotesSidebarLayoutWOC)

export default NotesSidebarLayout
