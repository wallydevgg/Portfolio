import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, LayoutDashboard, LogOut, Settings, Menu, Briefcase, Code2, FolderOpen, Search, Mail, Bell, ChevronDown, UserRound, FileText, Archive } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import "./DashboardLayout.scss";
import { Switch, ThemeContext } from "@/barrell";

// NavLink marca el item activo; los items del nav eran <Link> y por eso ninguno
// se resaltaba salvo los del submenú. `extra` añade la clase de sub-item.
const navLinkClass =
  (extra = "") =>
  ({ isActive }) =>
    `dashboard__nav-link${extra ? ` ${extra}` : ""}${isActive ? " dashboard__nav-link--active" : ""}`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useContext(ThemeContext);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(() => location.pathname.startsWith("/dashboard/settings"));
  const [postsOpen, setPostsOpen] = useState(() => location.pathname.startsWith("/dashboard/posts"));

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const url = `${import.meta.env.VITE_API_URL || "/api/v1"}/contact?status_filter=new&page_size=1`;
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
          <NavLink to="/dashboard" end className={navLinkClass()}>
            <LayoutDashboard className="icon" />
            {sidebarOpen && <span>Overview</span>}
          </NavLink>
          <NavLink to="/dashboard/messages" className={navLinkClass()}>
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
          </NavLink>
          {/* Blog posts group (accordion) */}
          <div className="dashboard__nav-group">
            <button
              type="button"
              className="dashboard__nav-link dashboard__nav-toggle"
              onClick={() => {
                if (!sidebarOpen) {
                  navigate("/dashboard/posts");
                } else {
                  setPostsOpen((prev) => !prev);
                }
              }}
            >
              <BookOpen className="icon" />
              {sidebarOpen && <span>Blog Posts</span>}
              {sidebarOpen && (
                <ChevronDown className={`dashboard__chevron ${postsOpen ? "dashboard__chevron--open" : ""}`} size={16} />
              )}
            </button>

            {sidebarOpen && postsOpen && (
              <div className="dashboard__nav-submenu">
                <NavLink
                  to="/dashboard/posts"
                  end
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <BookOpen className="icon" size={16} />
                  <span>All Posts</span>
                </NavLink>
                <NavLink
                  to="/dashboard/posts/archived"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Archive className="icon" size={16} />
                  <span>Archived</span>
                </NavLink>
              </div>
            )}
          </div>
          <NavLink to="/dashboard/experience" className={navLinkClass()}>
            <Briefcase className="icon" />
            {sidebarOpen && <span>Experience</span>}
          </NavLink>
          <NavLink to="/dashboard/about" className={navLinkClass()}>
            <UserRound className="icon" />
            {sidebarOpen && <span>About</span>}
          </NavLink>
          <NavLink to="/dashboard/skills" className={navLinkClass()}>
            <Code2 className="icon" />
            {sidebarOpen && <span>Skills</span>}
          </NavLink>
          <NavLink to="/dashboard/projects" className={navLinkClass()}>
            <FolderOpen className="icon" />
            {sidebarOpen && <span>Projects</span>}
          </NavLink>

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
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Settings className="icon" size={16} />
                  <span>Settings</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/seo"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Search className="icon" size={16} />
                  <span>SEO</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/notifications"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Bell className="icon" size={16} />
                  <span>Notifications</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/cv"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <FileText className="icon" size={16} />
                  <span>CV</span>
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
  );
}
