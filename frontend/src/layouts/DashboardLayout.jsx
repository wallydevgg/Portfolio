import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, LayoutDashboard, LogOut, Settings, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-zinc-800">
          {sidebarOpen && <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md">
            <Menu className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            {sidebarOpen && <span>Overview</span>}
          </Link>
          <Link
            to="/dashboard/posts"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            {sidebarOpen && <span>Blog Posts</span>}
          </Link>
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center px-6 justify-end">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold text-sm">
              {user?.sub?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
