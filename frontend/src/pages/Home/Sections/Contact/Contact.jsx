import React, { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { t } from "@lingui/macro";

const INITIAL = { name: "", email: "", subject: "", message: "" };

const inputClass = "bg-transparent border border-[rgba(167,169,190,0.3)] rounded-lg px-[0.9rem] py-[0.65rem] font-[var(--font-1)] text-[0.9rem] outline-none transition-colors duration-200 resize-vertical text-[var(--LM-Title)] dark:text-[var(--DM-Title)] focus:border-[var(--color-primary)] placeholder:text-[rgba(167,169,190,0.5)] w-full";
const labelClass = "text-[0.85rem] font-semibold text-[var(--parrafos)]";
const fieldClass = "flex flex-col gap-[0.4rem]";

const Contact = () => {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    <div className="w-full max-w-[700px] my-8 p-8 mx-auto max-[599px]:p-4" id="contact">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[2rem] font-semibold whitespace-nowrap text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
          <span className="hashTag">#</span>{t`contact.title`}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-4 p-12 text-[#166534] text-center">
          <CheckCircle size={40} className="text-[#22c55e]" />
          <p className="text-[1.1rem] font-semibold">{t`contact.success`}</p>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
          {error && (
            <p className="text-[#dc2626] text-[0.875rem] mb-4 px-4 py-[0.65rem] border border-[#dc2626] rounded-[6px] bg-[rgba(220,38,38,0.05)]">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-5 max-[599px]:grid-cols-1">
            <div className={fieldClass}>
              <label htmlFor="name" className={labelClass}>{t`contact.name`}</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handle} required autoComplete="name" className={inputClass} />
            </div>
            <div className={fieldClass}>
              <label htmlFor="email" className={labelClass}>{t`contact.email`}</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handle} required autoComplete="email" className={inputClass} />
            </div>
          </div>

          <div className={fieldClass}>
            <label htmlFor="subject" className={labelClass}>{t`contact.subject`}</label>
            <input id="subject" name="subject" type="text" value={form.subject} onChange={handle} required className={inputClass} />
          </div>

          <div className={fieldClass}>
            <label htmlFor="message" className={labelClass}>{t`contact.message`}</label>
            <textarea id="message" name="message" rows={6} value={form.message} onChange={handle} required className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="self-start inline-flex items-center justify-center gap-2 px-8 py-[0.7rem] bg-transparent border border-[var(--color-primary)] rounded-[20px] text-[var(--color-primary)] font-[var(--font-1)] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={15} />
            {loading ? t`contact.sending` : t`contact.send`}
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
