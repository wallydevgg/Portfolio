// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Sections/Contact/Contact.jsx
import React, { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import "./Contact.scss";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

const INITIAL = { name: "", email: "", subject: "", message: "" };

const Contact = () => {
  useLingui();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://formspree.io/f/xpwzqqnk", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setForm(INITIAL);
    } catch {
      setError(t`contact.error`);
    } finally {
      setLoading(false);
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

          <button type="submit" className="contact__submit" disabled={loading}>
            <Send size={15} />
            {loading ? t`contact.sending` : t`contact.send`}
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
