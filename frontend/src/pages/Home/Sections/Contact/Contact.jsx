// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Sections/Contact/Contact.jsx
import React, { useState, useEffect, useRef } from "react";
import { Send, CheckCircle } from "lucide-react";
import "./Contact.scss";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { TURNSTILE_SITE_KEY, loadTurnstile } from "@/features/contact/turnstile";

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
  const widgetIdRef = useRef(null);

  // El widget se monta explícitamente en vez de dejar que el script escanee el
  // DOM: el escaneo automático solo corre una vez al cargar, y este formulario
  // aparece y desaparece con el estado `sent`.
  useEffect(() => {
    let widgetId = null;
    let cancelled = false;

    loadTurnstile().then((turnstile) => {
      if (cancelled || !turnstile || !turnstileRef.current) return;
      widgetId = turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
      });
      widgetIdRef.current = widgetId;
    });

    return () => {
      cancelled = true;
      if (widgetId !== null && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, []);

  const handle = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // El token se pide por id de widget, no por nodo: con render() explícito
      // el id es la referencia fiable. Si el script no cargó, va vacío y lo
      // rechaza el servidor, que es quien decide.
      let token = "";
      if (window.turnstile && widgetIdRef.current !== null) {
        token = window.turnstile.getResponse(widgetIdRef.current) || "";
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
      // Un token de Turnstile es de un solo uso: sin reset, un segundo envío
      // reutilizaría el ya gastado y el servidor lo rechazaría.
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
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

          {/* Sin condicional: el contenedor existe siempre y lo rellena
              turnstile.render(). Antes el bloque colgaba de una variable de
              entorno y, con esa variable vacía en el build, desaparecía entero
              del bundle sin dejar rastro. */}
          <div ref={turnstileRef} style={{ marginBottom: "1rem" }} />

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
