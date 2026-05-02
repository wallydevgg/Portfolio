import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, LayoutDashboard, LogOut, Settings, Menu, Briefcase, Code2, FolderOpen } from "lucide-react";
import { useState, useContext } from "react";
import { ToastProvider } from "../contexts/ToastContext";
import "./DashboardLayout.scss";
import { Switch, ThemeContext } from "@/barrell";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useContext(ThemeContext);

  return (
    <ToastProvider>
      <div className={`dashboard ${theme}-theme`}>
      {/* Sidebar */}
      <aside className={`dashboard__sidebar ${sidebarOpen ? "dashboard__sidebar--open" : "dashboard__sidebar--closed"}`}>
        <div className="dashboard__sidebar-header">
          {sidebarOpen && <span>Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="dashboard__menu-btn">
            <Menu className="icon" />
          </button>
        </div>

        <nav className="dashboard__nav">
          <Link to="/dashboard" className="dashboard__nav-link">
            <LayoutDashboard className="icon" />
            {sidebarOpen && <span>Overview</span>}
          </Link>
          <Link to="/dashboard/posts" className="dashboard__nav-link">
            <BookOpen className="icon" />
            {sidebarOpen && <span>Blog Posts</span>}
          </Link>
          <Link to="/dashboard/experience" className="dashboard__nav-link">
            <Briefcase className="icon" />
            {sidebarOpen && <span>Experience</span>}
          </Link>
          <Link to="/dashboard/skills" className="dashboard__nav-link">
            <Code2 className="icon" />
            {sidebarOpen && <span>Skills</span>}
          </Link>
          <Link to="/dashboard/projects" className="dashboard__nav-link">
            <FolderOpen className="icon" />
            {sidebarOpen && <span>Projects</span>}
          </Link>
          <Link to="/dashboard/settings" className="dashboard__nav-link">
            <Settings className="icon" />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        <div className="dashboard__sidebar-footer">
          <button onClick={logout} className="dashboard__logout-btn">
            <LogOut className="icon" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard__main">
        <header className="dashboard__header">
          <div className="flex items-center gap-3">
            <Switch />
            <div className="dashboard__user-avatar">
              {user?.sub?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <div className="dashboard__content">
          <Outlet />
        </div>
      </main>
    </div>
    </ToastProvider>
  );
}
