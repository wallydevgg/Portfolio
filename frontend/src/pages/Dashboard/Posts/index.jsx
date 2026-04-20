import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit3, Trash2 } from "lucide-react";

export default function PostsPage() {
  const [posts, setPosts] = useState([
    { id: 1, title: "Welcome to my new Blog", status: "Published", date: "2026-04-19" },
    { id: 2, title: "Building a SaaS Platform", status: "Draft", date: "2026-04-20" },
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Blog Posts</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your portfolio articles here.</p>
        </div>
        <Link
          to="/dashboard/posts/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-medium border-b border-gray-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{post.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === "Published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{post.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-zinc-500">
                  No posts created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
