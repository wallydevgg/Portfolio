import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered, Heading2, Quote } from 'lucide-react'

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 dark:text-indigo-400 underline cursor-pointer',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] p-4 bg-white dark:bg-zinc-900 border border-t-0 border-gray-200 dark:border-zinc-800 rounded-b-md',
      },
    },
  })

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ onClick, isActive, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${isActive ? 'bg-gray-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400' : 'text-zinc-600 dark:text-zinc-400'}`}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="w-full flex flex-col shadow-sm rounded-md overflow-hidden text-left mt-2">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-t-md">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} />
        
        <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
        
        <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
        
        <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} />
      </div>
      
      <EditorContent editor={editor} />
    </div>
  )
}
