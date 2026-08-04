import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, LayoutDashboard, LogOut, Settings, Menu, Briefcase, Code2, FolderOpen, Search, Mail, Bell, ChevronDown, UserRound } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { ToastProvider } from "../contexts/ToastContext";
import "./DashboardLayout.scss";
import { Switch, ThemeContext } from "@/barrell";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useContext(ThemeContext);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(() => location.pathname.startsWith("/dashboard/settings"));

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/contact?status_filter=new&page_size=1`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNewMessagesCount(data.new_count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread messages count", err);
      }
    };
    fetchUnreadCount();
    // Poll every 2 minutes
    const interval = setInterval(fetchUnreadCount, 120000);
    return () => clearInterval(interval);
  }, []);

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
          <Link to="/dashboard/messages" className="dashboard__nav-link">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Mail className="icon" />
              {newMessagesCount > 0 && !sidebarOpen && (
                <span className="dashboard__badge-dot"></span>
              )}
            </div>
            {sidebarOpen && (
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span>Messages</span>
                {newMessagesCount > 0 && <span className="dashboard__badge">{newMessagesCount}</span>}
              </div>
            )}
          </Link>
          <Link to="/dashboard/posts" className="dashboard__nav-link">
            <BookOpen className="icon" />
            {sidebarOpen && <span>Blog Posts</span>}
          </Link>
          <Link to="/dashboard/experience" className="dashboard__nav-link">
            <Briefcase className="icon" />
            {sidebarOpen && <span>Experience</span>}
          </Link>
          <Link to="/dashboard/about" className="dashboard__nav-link">
            <UserRound className="icon" />
            {sidebarOpen && <span>About</span>}
          </Link>
          <Link to="/dashboard/skills" className="dashboard__nav-link">
            <Code2 className="icon" />
            {sidebarOpen && <span>Skills</span>}
          </Link>
          <Link to="/dashboard/projects" className="dashboard__nav-link">
            <FolderOpen className="icon" />
            {sidebarOpen && <span>Projects</span>}
          </Link>

          {/* Settings group (accordion) */}
          <div className="dashboard__nav-group">
            <button
              type="button"
              className="dashboard__nav-link dashboard__nav-toggle"
              onClick={() => {
                if (!sidebarOpen) {
                  navigate("/dashboard/settings");
                } else {
                  setSettingsOpen((prev) => !prev);
                }
              }}
            >
              <Settings className="icon" />
              {sidebarOpen && <span>Settings</span>}
              {sidebarOpen && (
                <ChevronDown className={`dashboard__chevron ${settingsOpen ? "dashboard__chevron--open" : ""}`} size={16} />
              )}
            </button>

            {sidebarOpen && settingsOpen && (
              <div className="dashboard__nav-submenu">
                <NavLink
                  to="/dashboard/settings"
                  end
                  className={({ isActive }) => `dashboard__nav-link dashboard__nav-subitem${isActive ? " dashboard__nav-link--active" : ""}`}
                >
                  <Settings className="icon" size={16} />
                  <span>Settings</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/seo"
                  className={({ isActive }) => `dashboard__nav-link dashboard__nav-subitem${isActive ? " dashboard__nav-link--active" : ""}`}
                >
                  <Search className="icon" size={16} />
                  <span>SEO</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/notifications"
                  className={({ isActive }) => `dashboard__nav-link dashboard__nav-subitem${isActive ? " dashboard__nav-link--active" : ""}`}
                >
                  <Bell className="icon" size={16} />
                  <span>Notifications</span>
                </NavLink>
              </div>
            )}
          </div>
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
          <div className="dashboard__header-controls">
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
