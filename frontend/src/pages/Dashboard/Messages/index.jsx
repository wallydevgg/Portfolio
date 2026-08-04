import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Mail, MailOpen, Reply, AlertTriangle, Archive, Trash2 } from "lucide-react";
import "./Messages.scss";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [stats, setStats] = useState({ total: 0, new_count: 0 });

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = new URL(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/contact`);
      if (filter) url.searchParams.append("status_filter", filter);
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.items);
        setStats({ total: data.total, new_count: data.new_count });
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "new": return <Mail size={16} className="status-icon new" />;
      case "read": return <MailOpen size={16} className="status-icon read" />;
      case "replied": return <Reply size={16} className="status-icon replied" />;
      case "spam": return <AlertTriangle size={16} className="status-icon spam" />;
      case "archived": return <Archive size={16} className="status-icon archived" />;
      default: return <Mail size={16} />;
    }
  };

  return (
    <div className="dashboard-messages">
      <div className="messages-header">
        <h1>Messages</h1>
        <div className="messages-stats">
          <span className="stat-badge new">{stats.new_count} New</span>
          <span className="stat-badge total">{stats.total} Total</span>
        </div>
      </div>

      <div className="messages-filters">
        <button className={filter === "" ? "active" : ""} onClick={() => setFilter("")}>All</button>
        <button className={filter === "new" ? "active" : ""} onClick={() => setFilter("new")}>New</button>
        <button className={filter === "read" ? "active" : ""} onClick={() => setFilter("read")}>Read</button>
        <button className={filter === "replied" ? "active" : ""} onClick={() => setFilter("replied")}>Replied</button>
        <button className={filter === "spam" ? "active" : ""} onClick={() => setFilter("spam")}>Spam</button>
      </div>

      {loading ? (
        <div className="loading">Loading messages...</div>
      ) : (
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">No messages found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Country</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className={`message-row ${msg.status}`}>
                    <td>
                      <span className={`status-badge ${msg.status}`}>
                        {getStatusIcon(msg.status)} {msg.status}
                      </span>
                    </td>
                    <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="sender-info">
                        <strong>{msg.name}</strong>
                        <span className="email">{msg.email}</span>
                      </div>
                    </td>
                    <td className="subject-cell">{msg.subject}</td>
                    <td>{msg.country || "-"}</td>
                    <td>
                      <Link to={`/dashboard/messages/${msg.id}`} className="btn-view">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
