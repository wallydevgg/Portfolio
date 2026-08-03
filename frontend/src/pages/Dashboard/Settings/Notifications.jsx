import React, { useState, useEffect } from "react";
import { Save, Bell, CheckCircle } from "lucide-react";
import "./Notifications.scss";

const NotificationsSettings = () => {
  const [settings, setSettings] = useState({
    master_enabled: false,
    comms_hub_url: "",
    comms_hub_token: "",
    contact_to_email: "",
    contact_email_subject: "Contact form from wallydev.dev",
    events: {
      new_contact_message: true,
      new_comment: false,
      new_like: false,
      reply_sent: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/settings/notifications`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    
    try {
      const token = localStorage.getItem("admin_token");
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/settings/notifications`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        setMessage({ text: "Settings saved successfully", type: "success" });
      } else {
        setMessage({ text: "Failed to save settings", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error saving settings", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage({ text: "", type: "" });
    
    try {
      const token = localStorage.getItem("admin_token");
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/settings/notifications/test`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setMessage({ text: "Test event sent successfully to comms-hub!", type: "success" });
      } else {
        const data = await res.json();
        setMessage({ text: data.detail || "Test failed", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error sending test event", type: "error" });
    } finally {
      setTesting(false);
    }
  };

  const toggleEvent = (key) => {
    setSettings(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [key]: !prev.events[key]
      }
    }));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="notifications-settings">
      <div className="settings-header">
        <h1><Bell size={24} /> Notification Settings</h1>
        <p>Configure email recipients and external webhooks (comms-hub).</p>
      </div>

      {message.text && (
        <div className={`alert-message ${message.type}`}>
          {message.type === "success" && <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h2>Email Notifications</h2>
          <div className="form-group">
            <label>Recipient Email</label>
            <input
              type="email"
              value={settings.contact_to_email || ""}
              onChange={(e) => setSettings({...settings, contact_to_email: e.target.value})}
              placeholder="e.g. contact@wallydev.dev (leave empty to use env default)"
            />
            <small>New contact messages will be sent to this address.</small>
          </div>
          <div className="form-group">
            <label>Email Subject</label>
            <input
              type="text"
              value={settings.contact_email_subject || ""}
              onChange={(e) => setSettings({...settings, contact_email_subject: e.target.value})}
              placeholder="e.g. Contact form from wallydev.dev"
            />
            <small>Subject line used for new contact message notifications.</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>comms-hub Webhook</h2>
          
          <div className="toggle-group master">
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.master_enabled}
                onChange={(e) => setSettings({...settings, master_enabled: e.target.checked})}
              />
              <span className="slider round"></span>
            </label>
            <div className="toggle-info">
              <strong>Enable Webhooks</strong>
              <span>Master switch for all external notifications</span>
            </div>
          </div>

          <div className={`webhook-config ${!settings.master_enabled ? 'disabled' : ''}`}>
            <div className="form-group">
              <label>comms-hub URL</label>
              <input
                type="url"
                value={settings.comms_hub_url || ""}
                onChange={(e) => setSettings({...settings, comms_hub_url: e.target.value})}
                placeholder="https://your-comms-hub.com/api/notify"
                disabled={!settings.master_enabled}
              />
            </div>
            
            <div className="form-group">
              <label>Auth Token (Optional)</label>
              <input
                type="password"
                value={settings.comms_hub_token || ""}
                onChange={(e) => setSettings({...settings, comms_hub_token: e.target.value})}
                placeholder="Bearer token if required"
                disabled={!settings.master_enabled}
              />
            </div>

            <div className="events-list">
              <h3>Events to send</h3>
              
              <div className="toggle-group">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.events.new_contact_message}
                    onChange={() => toggleEvent('new_contact_message')}
                    disabled={!settings.master_enabled}
                  />
                  <span className="slider round"></span>
                </label>
                <span>New Contact Message</span>
              </div>
              
              <div className="toggle-group">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.events.reply_sent}
                    onChange={() => toggleEvent('reply_sent')}
                    disabled={!settings.master_enabled}
                  />
                  <span className="slider round"></span>
                </label>
                <span>Reply Sent from Dashboard</span>
              </div>
              
              <div className="toggle-group">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.events.new_comment}
                    onChange={() => toggleEvent('new_comment')}
                    disabled={!settings.master_enabled}
                  />
                  <span className="slider round"></span>
                </label>
                <span>New Blog Comment (Future)</span>
              </div>
              
              <div className="toggle-group">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.events.new_like}
                    onChange={() => toggleEvent('new_like')}
                    disabled={!settings.master_enabled}
                  />
                  <span className="slider round"></span>
                </label>
                <span>New Like (Future)</span>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-test" 
              onClick={handleTest}
              disabled={!settings.master_enabled || !settings.comms_hub_url || testing}
            >
              {testing ? "Sending..." : "Send Test Event"}
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationsSettings;
