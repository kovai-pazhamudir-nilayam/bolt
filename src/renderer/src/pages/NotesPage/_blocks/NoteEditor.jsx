import { Button, Input, Select, Space, Typography } from 'antd'
import RichTextEditor from './RichTextEditor'

const { Text } = Typography

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

const NoteEditor = ({
  isCreatingNew = false,
  selectedNote = null,
  editingState,
  companies,
  onTitleChange,
  onCompanyChange,
  onContentChange,
  onFocusOut,
  onSaveNewNote,
  onCancelNewNote
}) => {
  return (
    <>
      {/* Header */}
      <div className="content-header">
        <div className="header-content">
          <div className="note-info">
            <Input
              value={editingState.title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={isCreatingNew ? undefined : onFocusOut}
              placeholder="Enter note title..."
              variant="borderless"
              className={isCreatingNew ? 'new-note-title-input' : 'editable-title-input'}
            />
            <div className="note-meta">
              {!isCreatingNew && selectedNote && (
                <Text className="date">{formatDate(selectedNote.created_at)}</Text>
              )}
              <div className={isCreatingNew ? 'note-meta' : 'editable-meta'}>
                <Select
                  value={editingState.company}
                  onChange={onCompanyChange}
                  onBlur={isCreatingNew ? undefined : onFocusOut}
                  placeholder="Company (optional)"
                  options={companies.map((c) => ({
                    label: `${c.company_code} - ${c.company_name}`,
                    value: c.company_code
                  }))}
                  variant="borderless"
                  className={isCreatingNew ? 'new-note-company-select' : 'editable-company-select'}
                  allowClear
                />
              </div>
            </div>
          </div>

          <div className="actions">
            {isCreatingNew ? (
              <Space>
                <Button
                  type="primary"
                  onClick={onSaveNewNote}
                  disabled={!editingState.title.trim()}
                >
                  Save
                </Button>
                <Button onClick={onCancelNewNote}>Cancel</Button>
              </Space>
            ) : (
              editingState.hasUnsavedChanges && (
                <Text className="auto-save-indicator">Saving...</Text>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        <RichTextEditor
          content={editingState.content}
          onChange={onContentChange}
          onBlur={onFocusOut}
          placeholder="Start typing your note here..."
        />
      </div>
    </>
  )
}

export default NoteEditor
