import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Highlighter
} from 'lucide-react'
import { Button, Tooltip, Space, Divider } from 'antd'
import './RichTextEditor.less'

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  const buttons = [
    {
      icon: <Bold size={16} />,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold')
    },
    {
      icon: <Italic size={16} />,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic')
    },
    {
      icon: <UnderlineIcon size={16} />,
      title: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline')
    },
    {
      icon: <Strikethrough size={16} />,
      title: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike')
    },
    {
      icon: <Code size={16} />,
      title: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code')
    },
    {
      icon: <Highlighter size={16} />,
      title: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight')
    },
    'divider',
    {
      icon: <Heading1 size={16} />,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 })
    },
    {
      icon: <Heading2 size={16} />,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 })
    },
    'divider',
    {
      icon: <List size={16} />,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList')
    },
    {
      icon: <ListOrdered size={16} />,
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList')
    },
    {
      icon: <Quote size={16} />,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote')
    },
    'divider',
    {
      icon: <AlignLeft size={16} />,
      title: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' })
    },
    {
      icon: <AlignCenter size={16} />,
      title: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' })
    },
    {
      icon: <AlignRight size={16} />,
      title: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' })
    },
    'divider',
    {
      icon: <Undo size={16} />,
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo()
    },
    {
      icon: <Redo size={16} />,
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo()
    }
  ]

  return (
    <div className="editor-menubar">
      <Space wrap size={[4, 4]}>
        {buttons.map((btn, index) => {
          if (btn === 'divider') {
            return (
              <Divider
                key={`divider-${index}`}
                type="vertical"
                style={{ height: '20px', margin: '0 4px' }}
              />
            )
          }
          return (
            <Tooltip key={btn.title} title={btn.title}>
              <Button
                type={btn.isActive ? 'primary' : 'text'}
                size="small"
                onClick={btn.action}
                disabled={btn.disabled}
                icon={btn.icon}
                className={`menu-button ${btn.isActive ? 'is-active' : ''}`}
              />
            </Tooltip>
          )
        })}
      </Space>
    </div>
  )
}

const RichTextEditor = ({ content, onChange, onBlur, placeholder = 'Start typing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Typography,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onBlur: () => {
      onBlur?.()
    }
  })

  // Sync content when it changes externally (e.g. switching notes), but not while typing
  useEffect(() => {
    if (editor && !editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false)
    }
  }, [content, editor])

  return (
    <div className="rich-text-editor-container">
      <MenuBar editor={editor} />
      <div className="editor-content-wrapper">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  )
}

export default RichTextEditor
