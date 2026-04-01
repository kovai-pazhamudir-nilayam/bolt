import { Button, Input, Select, Space, Tag, Typography } from 'antd'
import { Check, Loader2 } from 'lucide-react'
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

const getWordCount = (html) => {
  if (!html) return 0
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').filter((w) => w.length > 0).length : 0
}

const SaveIndicator = ({ saveStatus }) => {
  if (saveStatus === 'saving') {
    return (
      <Text className="save-indicator saving">
        <Loader2 size={12} className="spin-icon" /> Saving...
      </Text>
    )
  }
  if (saveStatus === 'saved') {
    return (
      <Text className="save-indicator saved">
        <Check size={12} /> Saved
      </Text>
    )
  }
  return null
}

const NoteEditor = ({
  isCreatingNew = false,
  selectedNote = null,
  editingState,
  companies,
  saveStatus,
  onTitleChange,
  onCompanyChange,
  onContentChange,
  onFocusOut,
  onSaveNewNote,
  onCancelNewNote
}) => {
  const wordCount = getWordCount(editingState.content)

  return (
    <>
      <div className="content-header">
        <Input
          value={editingState.title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={isCreatingNew ? undefined : onFocusOut}
          placeholder="Untitled note"
          variant="borderless"
          className="title-input"
        />

        <div className="header-meta-row">
          <Space size={12} className="meta-left">
            {!isCreatingNew && selectedNote && (
              <Text className="date-text">{formatDate(selectedNote.created_at)}</Text>
            )}
            <Select
              value={editingState.company || undefined}
              onChange={onCompanyChange}
              onBlur={isCreatingNew ? undefined : onFocusOut}
              placeholder="No company"
              options={companies.map((c) => ({
                label: `${c.company_code} - ${c.company_name}`,
                value: c.company_code
              }))}
              variant="borderless"
              className="company-select"
              allowClear
              style={{ minWidth: 160 }}
            />
          </Space>

          <Space size={8} className="meta-right">
            {wordCount > 0 && (
              <Tag bordered={false} color="default" className="word-count-tag">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </Tag>
            )}
            {isCreatingNew ? (
              <Space size={8}>
                <Button
                  type="primary"
                  size="small"
                  onClick={onSaveNewNote}
                  disabled={!editingState.title.trim()}
                >
                  Save
                </Button>
                <Button size="small" onClick={onCancelNewNote}>
                  Cancel
                </Button>
              </Space>
            ) : (
              <SaveIndicator saveStatus={saveStatus} />
            )}
          </Space>
        </div>
      </div>

      <div className="content-area">
        <RichTextEditor
          content={editingState.content}
          onChange={onContentChange}
          onBlur={onFocusOut}
          placeholder="Start writing..."
        />
      </div>
    </>
  )
}

export default NoteEditor
