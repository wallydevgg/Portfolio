import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading2,
  Quote,
  ImagePlus,
  Clapperboard,
  Loader2,
} from 'lucide-react'
import UrlDialog from './UrlDialog'
import Embed from './EmbedNode'
import { parseEmbedUrl } from '../embedProviders'
import { useBlogApi } from '../useBlogApi'
import './UrlDialog.scss'

export default function TiptapEditor({ content, onChange, onError }) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkInitialUrl, setLinkInitialUrl] = useState('')
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { uploadImage } = useBlogApi()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: { class: 'post-image' },
      }),
      Embed,
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

  const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled, title }) => (
    <button
      onClick={onClick}
      className={`tiptap-toolbar__btn ${isActive ? 'tiptap-toolbar__btn--active' : ''}`}
      type="button"
      disabled={disabled}
      title={title}
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

  const applyEmbed = (url) => {
    const parsed = parseEmbedUrl(url)
    if (!parsed) {
      // El diálogo sigue abierto: la URL no sirve y hay que corregirla.
      onError?.('Esa URL no es de YouTube, TikTok, Instagram o Facebook.')
      return
    }
    setEmbedDialogOpen(false)
    editor.chain().focus().setEmbed({ provider: parsed.provider, embedId: parsed.id }).run()
  }

  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0]
    // Se limpia el input para que elegir la misma imagen dos veces vuelva a
    // disparar el change.
    event.target.value = ''
    if (!file) return

    try {
      setUploading(true)
      const { url } = await uploadImage(file)
      editor.chain().focus().setImage({ src: url, alt: file.name }).run()
    } catch (err) {
      onError?.(err.message || 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="tiptap-container">
      <div className="tiptap-toolbar">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Negrita" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Cursiva" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Subrayado" />

        <div className="tiptap-toolbar__divider" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Título" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Cita" />

        <div className="tiptap-toolbar__divider" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Lista" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Lista numerada" />

        <div className="tiptap-toolbar__divider" />

        <ToolbarButton onClick={openLinkDialog} isActive={editor.isActive('link')} icon={LinkIcon} title="Enlace" />
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          icon={uploading ? Loader2 : ImagePlus}
          disabled={uploading}
          title="Insertar imagen"
        />
        <ToolbarButton onClick={() => setEmbedDialogOpen(true)} isActive={editor.isActive('embed')} icon={Clapperboard} title="Insertar vídeo" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFilePicked}
        hidden
      />

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

      <UrlDialog
        open={embedDialogOpen}
        title="Insertar vídeo"
        label="URL del vídeo"
        placeholder="https://www.youtube.com/watch?v=..."
        confirmLabel="Insertar"
        hint="YouTube (vídeos y Shorts), TikTok, Instagram (posts y reels) y Facebook."
        onConfirm={applyEmbed}
        onCancel={() => setEmbedDialogOpen(false)}
      />
    </div>
  )
}
