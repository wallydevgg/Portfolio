import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, LayoutDashboard, LogOut, Settings, Menu, Briefcase, Code2, FolderOpen, Search, Mail, Bell, ChevronDown, UserRound, FileText, Archive, Palette, Languages } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import "./DashboardLayout.scss";
import { ThemeContext } from "@/barrell";
import { getStoredToken } from "@/features/auth/tokenStorage";

// NavLink marca el item activo; los items del nav eran <Link> y por eso ninguno
// se resaltaba salvo los del submenú. `extra` añade la clase de sub-item.
const navLinkClass =
  (extra = "") =>
  ({ isActive }) =>
    `dashboard__nav-link${extra ? ` ${extra}` : ""}${isActive ? " dashboard__nav-link--active" : ""}`;

export default function DashboardLayout() {
  // Suscribe el menú al cambio de idioma: sin esto las etiquetas se quedan
  // en el idioma con el que se montó el layout.
  useLingui();
  const { profile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useContext(ThemeContext);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = profile?.display_name || profile?.username || "Admin";
  const initial = displayName.charAt(0).toUpperCase();
  const [settingsOpen, setSettingsOpen] = useState(() => location.pathname.startsWith("/dashboard/settings"));
  const [postsOpen, setPostsOpen] = useState(() => location.pathname.startsWith("/dashboard/posts"));

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = getStoredToken();
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
          {sidebarOpen && (
            <div className="dashboard__identity">
              <div className="dashboard__user-avatar" title={displayName}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} />
                ) : (
                  initial
                )}
              </div>
              <span title={profile?.email || undefined}>{displayName}</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="dashboard__menu-btn">
            <Menu className="icon" />
          </button>
        </div>

        <nav className="dashboard__nav">
          <NavLink to="/dashboard" end className={navLinkClass()}>
            <LayoutDashboard className="icon" />
            {sidebarOpen && <span>{t`Overview`}</span>}
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
                <span>{t`Messages`}</span>
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
              {sidebarOpen && <span>{t`Blog Posts`}</span>}
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
                  <span>{t`All Posts`}</span>
                </NavLink>
                <NavLink
                  to="/dashboard/posts/archived"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Archive className="icon" size={16} />
                  <span>{t`Archived`}</span>
                </NavLink>
              </div>
            )}
          </div>
          <NavLink to="/dashboard/experience" className={navLinkClass()}>
            <Briefcase className="icon" />
            {sidebarOpen && <span>{t`Experience`}</span>}
          </NavLink>
          <NavLink to="/dashboard/about" className={navLinkClass()}>
            <UserRound className="icon" />
            {sidebarOpen && <span>{t`About`}</span>}
          </NavLink>
          <NavLink to="/dashboard/skills" className={navLinkClass()}>
            <Code2 className="icon" />
            {sidebarOpen && <span>{t`Skills`}</span>}
          </NavLink>
          <NavLink to="/dashboard/projects" className={navLinkClass()}>
            <FolderOpen className="icon" />
            {sidebarOpen && <span>{t`Projects`}</span>}
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
              {sidebarOpen && <span>{t`Settings`}</span>}
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
                  <span>{t`Settings`}</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/seo"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Search className="icon" size={16} />
                  <span>{t`SEO`}</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/notifications"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Bell className="icon" size={16} />
                  <span>{t`Notifications`}</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/cv"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <FileText className="icon" size={16} />
                  <span>{t`CV`}</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/profile"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <UserRound className="icon" size={16} />
                  <span>{t`Profile`}</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/theme"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Palette className="icon" size={16} />
                  <span>{t`Theme`}</span>
                </NavLink>
                <NavLink
                  to="/dashboard/settings/language"
                  className={navLinkClass("dashboard__nav-subitem")}
                >
                  <Languages className="icon" size={16} />
                  <span>{t`Language`}</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        <div className="dashboard__sidebar-footer">
          <button onClick={logout} className="dashboard__logout-btn">
            <LogOut className="icon" />
            {sidebarOpen && <span>{t`Logout`}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard__main">
        <div className="dashboard__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
