// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Sections/Contact/Contact.jsx
import React, { useState, useEffect, useRef } from "react";
import { Send, CheckCircle } from "lucide-react";
import "./Contact.scss";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

const INITIAL = { name: "", email: "", subject: "", message: "", website: "" };

// Simple client-side fingerprinting
const generateFingerprint = () => {
  try {
    const nav = window.navigator;
    const screen = window.screen;
    const str = `${nav.userAgent}|${nav.language}|${screen.colorDepth}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  } catch (e) {
    return "unknown";
  }
};

const Contact = () => {
  useLingui();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const turnstileRef = useRef(null);

  // Load Turnstile script
  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handle = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Get Turnstile token if widget exists
      let token = "";
      if (window.turnstile && turnstileRef.current) {
        token = window.turnstile.getResponse(turnstileRef.current) || "";
      }

      const payload = {
        ...form,
        fingerprint: generateFingerprint(),
        referrer: document.referrer || window.location.href,
        turnstile_token: token
      };

      const apiUrl = import.meta.env.VITE_API_URL || "/api/v1";
      const res = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to send message");
      }
      
      setSent(true);
      setForm(INITIAL);
    } catch (err) {
      setError(err.message || t`contact.error`);
    } finally {
      setLoading(false);
      // Reset Turnstile widget for next attempt
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
      }
    }
  };

  return (
    <div className="contact" id="contact">
      <div className="title-container">
        <h2>
          <span className="hashTag">#</span>
          {t`contact.title`}
        </h2>
        <div className="space-line"></div>
      </div>

      {sent ? (
        <div className="contact__success">
          <CheckCircle size={40} />
          <p>{t`contact.success`}</p>
        </div>
      ) : (
        <form className="contact__form" onSubmit={submit} noValidate>
          {error && <p className="contact__error">{error}</p>}

          {/* Honeypot field - hidden from real users */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              value={form.website}
              onChange={handle}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          <div className="contact__row">
            <div className="contact__field">
              <label htmlFor="name">{t`contact.name`}</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handle}
                required
                autoComplete="name"
              />
            </div>
            <div className="contact__field">
              <label htmlFor="email">{t`contact.email`}</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="contact__field">
            <label htmlFor="subject">{t`contact.subject`}</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handle}
              required
            />
          </div>

          <div className="contact__field">
            <label htmlFor="message">{t`contact.message`}</label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={form.message}
              onChange={handle}
              required
            />
          </div>

          {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
            <div 
              className="cf-turnstile" 
              data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              data-theme="dark"
              ref={turnstileRef}
              style={{ marginBottom: "1rem" }}
            ></div>
          )}

          <button type="submit" className="contact__submit" disabled={loading}>
            <Send size={15} />
            {loading ? t`contact.sending` : t`contact.send`}
          </button>
          
          <p style={{ fontSize: "0.75rem", color: "var(--parrafos)", marginTop: "0.5rem", textAlign: "center" }}>
            This site is protected by Cloudflare Turnstile and its <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>Privacy Policy</a> applies.
          </p>
        </form>
      )}
    </div>
  );
};

export default Contact;
