import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  ChevronRight,
  FileText,
  Globe,
  Loader2,
  Mail,
  Languages,
  Palette,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./Settings.scss";
import { getStoredToken } from "@/features/auth/tokenStorage";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

const SECTIONS = [
  {
    to: "/dashboard/settings/profile",
    icon: UserRound,
    title: "Profile Photo",
    description:
      "Upload the picture shown next to your name in the panel and on blog comment replies.",
    tag: "avatar",
  },
  {
    to: "/dashboard/settings/theme",
    icon: Palette,
    title: "Theme",
    description:
      "Choose light, dark, or follow your operating system setting.",
    tag: "appearance",
  },
  {
    to: "/dashboard/settings/language",
    icon: Languages,
    title: "Language",
    description:
      "Interface language for the dashboard and the public site.",
    tag: "en / es",
  },
  {
    to: "/dashboard/settings/seo",
    icon: Globe,
    title: "SEO Settings",
    description:
      "Manage page title, meta description, keywords and social sharing metadata for search engines.",
    tag: "en / es",
  },
  {
    to: "/dashboard/settings/notifications",
    icon: Bell,
    title: "Notification Settings",
    description:
      "Configure the contact form recipient, email subject, and external webhooks (comms-hub).",
    tag: "email + webhooks",
  },
  {
    to: "/dashboard/settings/cv",
    icon: FileText,
    title: "Resume / CV",
    description:
      "Upload the PDF used by the 'Download CV' button on the homepage hero.",
    tag: "pdf",
  },
];

export default function SettingsPage() {
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchSummary = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`${API_BASE}/settings/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setNotif(data);
      } catch (err) {
        if (!cancelled) setError("Could not load settings summary.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <div className="settings-page__header-text">
          <Settings className="settings-page__header-icon" />
          <div>
            <h1>Settings</h1>
            <p>Manage your portfolio's SEO, notifications and email delivery.</p>
          </div>
        </div>
      </div>

      {error && <div className="settings-page__error">{error}</div>}

      {/* Navigation cards */}
      <div className="settings-page__grid">
        {SECTIONS.map(({ to, icon: Icon, title, description, tag }) => (
          <Link key={to} to={to} className="settings-card">
            <div className="settings-card__icon">
              <Icon size={22} />
            </div>
            <div className="settings-card__body">
              <div className="settings-card__title-row">
                <h2>{title}</h2>
                <span className="settings-card__tag">{tag}</span>
              </div>
              <p>{description}</p>
            </div>
            <ChevronRight className="settings-card__chevron" size={18} />
          </Link>
        ))}
      </div>

      {/* Current email summary */}
      <div className="settings-page__summary">
        <div className="settings-page__summary-header">
          <Mail size={18} />
          <h2>Email Delivery</h2>
        </div>

        {loading ? (
          <div className="settings-page__summary-loading">
            <Loader2 className="spinning" size={16} /> Loading…
          </div>
        ) : notif ? (
          <div className="settings-page__summary-grid">
            <div className="summary-item">
              <span className="summary-item__label">Contact notifications go to</span>
              <span className="summary-item__value">
                {notif.contact_to_email || "env default (contact@wallydev.dev)"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-item__label">Email subject</span>
              <span className="summary-item__value">{notif.contact_email_subject || "—"}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item__label">Webhooks (comms-hub)</span>
              <span className={`summary-item__value ${notif.master_enabled ? "summary-item__value--on" : "summary-item__value--off"}`}>
                {notif.master_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-item__label">Sender address</span>
              <span className="summary-item__value">contact@wallydev.dev</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Authentication hint */}
      <div className="settings-page__auth-hint">
        <ShieldCheck size={16} />
        <span>
          Sending is authenticated with SPF, DKIM and DMARC — replies from the dashboard
          are delivered with proper <code>Message-ID</code> headers.
        </span>
      </div>
    </div>
  );
}
