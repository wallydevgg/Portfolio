import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send, Trash2, AlertTriangle, Archive, Check } from "lucide-react";
import "./Detail.scss";
import { getStoredToken } from "@/features/auth/tokenStorage";

const MessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchMessage = async () => {
    try {
      const token = getStoredToken();
      const url = `${import.meta.env.VITE_API_URL || "/api/v1"}/contact/${id}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data);
        // Mark as read if new
        if (data.status === "new") {
          updateStatus("read");
        }
      } else {
        navigate("/dashboard/messages");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      const token = getStoredToken();
      const url = `${import.meta.env.VITE_API_URL || "/api/v1"}/contact/${id}/status`;
      await fetch(url, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      setMsg(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async () => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const token = getStoredToken();
      const url = `${import.meta.env.VITE_API_URL || "/api/v1"}/contact/${id}`;
      await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/dashboard/messages");
    } catch (err) {
      console.error(err);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setReplying(true);
    try {
      const token = getStoredToken();
      const url = `${import.meta.env.VITE_API_URL || "/api/v1"}/contact/${id}/reply`;
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: replyText })
      });
      
      if (res.ok) {
        setReplyText("");
        fetchMessage(); // Refresh to get new replies list
      } else {
        alert("Failed to send reply");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending reply");
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!msg) return null;

  return (
    <div className="message-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate("/dashboard/messages")}>
          <ArrowLeft size={18} /> Back to Messages
        </button>
        <div className="actions">
          {msg.status !== "spam" && (
            <button className="btn-action warning" onClick={() => updateStatus("spam")}>
              <AlertTriangle size={16} /> Mark Spam
            </button>
          )}
          {msg.status !== "archived" && (
            <button className="btn-action" onClick={() => updateStatus("archived")}>
              <Archive size={16} /> Archive
            </button>
          )}
          <button className="btn-action danger" onClick={deleteMessage}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="message-card">
        <div className="card-header">
          <div className="sender">
            <h2>{msg.subject}</h2>
            <div className="meta">
              <strong>{msg.name}</strong> &lt;{msg.email}&gt;
              <span className="date">{new Date(msg.created_at).toLocaleString()}</span>
            </div>
          </div>
          <span className={`status-badge ${msg.status}`}>{msg.status}</span>
        </div>

        <div className="card-body">
          <p className="message-text">{msg.message}</p>
        </div>

        <div className="card-footer">
          <div className="tech-meta">
            <span><strong>IP:</strong> {msg.ip_address || "N/A"}</span>
            <span><strong>Location:</strong> {msg.country ? `${msg.region}, ${msg.country}` : "N/A"}</span>
            <span><strong>Captcha:</strong> {msg.captcha_success !== null ? (msg.captcha_success > 0 ? "Pass" : "Fail") : "Skipped"}</span>
          </div>
        </div>
      </div>

      {msg.replies && msg.replies.length > 0 && (
        <div className="replies-section">
          <h3>Previous Replies</h3>
          {msg.replies.map((reply, idx) => (
            <div key={idx} className="reply-card">
              <div className="reply-header">
                <strong>You</strong>
                <span className="date">{new Date(reply.sent_at).toLocaleString()}</span>
              </div>
              <p className="reply-text">{reply.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="reply-section">
        <h3>Send a Reply</h3>
        <form onSubmit={sendReply}>
          <textarea
            rows="6"
            placeholder="Write your reply here... It will be sent via email."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
          />
          <button type="submit" disabled={replying || !replyText.trim()}>
            <Send size={16} />
            {replying ? "Sending..." : "Send Reply"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageDetail;
