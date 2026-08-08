import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered, Heading2, Quote } from 'lucide-react'
import UrlDialog from './UrlDialog'
import './UrlDialog.scss'

export default function TiptapEditor({ content, onChange }) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkInitialUrl, setLinkInitialUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'dashboard-prose',
      },
    },
  })

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ onClick, isActive, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`tiptap-toolbar__btn ${isActive ? 'tiptap-toolbar__btn--active' : ''}`}
      type="button"
    >
      <Icon className="icon" />
    </button>
  );

  const openLinkDialog = () => {
    setLinkInitialUrl(editor.getAttributes('link').href || '')
    setLinkDialogOpen(true)
  }

  // Vaciar el campo y aceptar quita el enlace: es la forma de deshacerlo sin un
  // botón aparte.
  const applyLink = (url) => {
    setLinkDialogOpen(false)
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="tiptap-container">
      <div className="tiptap-toolbar">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} />
        
        <div className="tiptap-toolbar__divider" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
        
        <div className="tiptap-toolbar__divider" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
        
        <div className="tiptap-toolbar__divider" />

        <ToolbarButton onClick={openLinkDialog} isActive={editor.isActive('link')} icon={LinkIcon} />
      </div>

      <EditorContent editor={editor} />

      <UrlDialog
        open={linkDialogOpen}
        title="Insertar enlace"
        initialValue={linkInitialUrl}
        confirmLabel="Aplicar"
        hint="Dejalo vacío para quitar el enlace."
        onConfirm={applyLink}
        onCancel={() => setLinkDialogOpen(false)}
      />
    </div>
  )
}
