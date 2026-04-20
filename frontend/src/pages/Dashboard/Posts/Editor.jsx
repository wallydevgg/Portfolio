import { useState } from "react";
import TiptapEditor from "../../../features/blog/components/TiptapEditor";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Start writing your new article...</p>");

  const handleSave = () => {
    // API logic will go here
    console.log("Saving post:", { title, content });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/posts" className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Create New Post</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors font-medium text-sm shadow-sm"
        >
          <Save className="w-4 h-4" />
          Publish Post
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., My Journey as a Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Content
          </label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
