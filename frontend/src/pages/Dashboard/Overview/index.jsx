import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Briefcase,
  ChevronRight,
  Code2,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  Mail,
  MailOpen,
  PlusCircle,
} from "lucide-react";
import "./Overview.scss";
import { getStoredToken } from "@/features/auth/tokenStorage";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

const STATUS_LABELS = {
  new: "New",
  read: "Read",
  replied: "Replied",
  spam: "Spam",
  archived: "Archived",
};

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`${API_BASE}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError("Could not load dashboard stats.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // El acento es decisión de diseño y vive aquí, no en la API. Se inyecta como
  // custom property y de ahí lo toman icono, borde y número.
  const cards = stats
    ? [
        {
          to: "/dashboard/messages",
          icon: Mail,
          title: "Messages",
          accent: "#22d3ee",
          value: `${stats.messages.new}`,
          unit: "new",
          sub: `${stats.messages.total} total`,
          highlight: stats.messages.new > 0,
        },
        {
          to: "/dashboard/posts",
          icon: BookOpen,
          title: "Blog Posts",
          accent: "#ff8906",
          value: `${stats.posts.published}`,
          unit: "published",
          sub: `${stats.posts.drafts} drafts`,
          highlight: false,
        },
        {
          to: "/dashboard/skills",
          icon: Code2,
          title: "Skills",
          accent: "#a78bfa",
          value: `${stats.skills.total}`,
          unit: "skills",
          sub: `${stats.skills.categories} categories`,
          highlight: false,
        },
        {
          to: "/dashboard/projects",
          icon: FolderOpen,
          title: "Projects",
          accent: "#2dd4bf",
          value: `${stats.projects}`,
          unit: "total",
          sub: "in portfolio",
          highlight: false,
        },
        {
          to: "/dashboard/experience",
          icon: Briefcase,
          title: "Experiences",
          accent: "#fbbf24",
          value: `${stats.experiences}`,
          unit: "total",
          sub: "work history",
          highlight: false,
        },
      ]
    : [];

  const quickLinks = [
    { to: "/dashboard/posts/new", label: "New Post" },
    { to: "/dashboard/messages", label: "Messages" },
    { to: "/dashboard/skills", label: "Skills" },
    { to: "/dashboard/projects", label: "Projects" },
    { to: "/dashboard/experience", label: "Experience" },
    { to: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="overview-page">
      <div className="overview-page__header">
        <div className="overview-page__header-text">
          <LayoutDashboard className="overview-page__header-icon" />
          <div>
            <h1>Overview</h1>
            <p>Your portfolio at a glance — messages, posts, skills and more.</p>
          </div>
        </div>
      </div>

      {error && <div className="overview-page__error">{error}</div>}

      {loading ? (
        <div className="overview-page__loading">
          <Loader2 className="spinning" size={16} /> Loading…
        </div>
      ) : stats ? (
        <>
          {/* Stats cards */}
          <div className="overview-page__grid">
            {cards.map(({ to, icon: Icon, title, accent, value, unit, sub, highlight }) => (
              <Link
                key={to}
                to={to}
                style={{ "--card-accent": accent }}
                className={`overview-card${highlight ? " overview-card--highlight" : ""}`}
              >
                <div className="overview-card__icon">
                  <Icon size={22} />
                </div>
                <div className="overview-card__body">
                  <h2>{title}</h2>
                  <span className="overview-card__value">
                    {value}
                    <span className="overview-card__unit">{unit}</span>
                  </span>
                  <span className="overview-card__sub">{sub}</span>
                </div>
                <ChevronRight className="overview-card__chevron" size={18} />
              </Link>
            ))}
          </div>

          {/* Recent messages */}
          <div className="overview-page__recent">
            <div className="overview-page__recent-header">
              <Mail size={18} />
              <h2>Recent Messages</h2>
              <Link to="/dashboard/messages" className="overview-page__view-all">
                View all
              </Link>
            </div>

            {stats.recent_messages.length === 0 ? (
              <div className="overview-page__empty">
                <MailOpen size={34} strokeWidth={1.5} />
                <p>No messages yet</p>
                <span>New messages from the contact form will show up here.</span>
              </div>
            ) : (
              <ul className="overview-page__recent-list">
                {stats.recent_messages.map((msg) => (
                  <li key={msg.id}>
                    <Link to={`/dashboard/messages/${msg.id}`} className="overview-message">
                      <div className="overview-message__sender">
                        <strong>{msg.name}</strong>
                        <span className="overview-message__email">{msg.email}</span>
                      </div>
                      <span className="overview-message__subject">{msg.subject}</span>
                      <span className={`overview-message__status ${msg.status}`}>
                        {STATUS_LABELS[msg.status] || msg.status}
                      </span>
                      <span className="overview-message__date">
                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick links */}
          <div className="overview-page__quick">
            <div className="overview-page__quick-header">
              <PlusCircle size={18} />
              <h2>Quick Actions</h2>
            </div>
            <div className="overview-page__quick-links">
              {quickLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="overview-page__quick-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
