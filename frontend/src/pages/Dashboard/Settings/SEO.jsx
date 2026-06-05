import { useState, useEffect, useCallback } from "react";
import { Globe, Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSeoApi } from "../../../features/settings/useSeoApi";
import { useToast } from "../../../contexts/ToastContext";
import "./SEO.scss";

const DEFAULT_SEO = {
  title: { en: "", es: "" },
  description: { en: "", es: "" },
  keywords: { en: "", es: "" },
  og_image: "",
  site_url: "",
  twitter_handle: "",
};

export default function SeoSettingsPage() {
  const [form, setForm] = useState(DEFAULT_SEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const { getSeoSettings, updateSeoSettings } = useSeoApi();
  const toast = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSeoSettings();
      setForm(data);
    } catch {
      setError("No se pudo cargar la configuración SEO. ¿Está el backend corriendo?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleLangChange = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSeoSettings({
        title: form.title,
        description: form.description,
        keywords: form.keywords,
        og_image: form.og_image,
        site_url: form.site_url,
        twitter_handle: form.twitter_handle,
      });
      setSaved(true);
      toast.success("Configuración SEO guardada con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="seo-page seo-page--loading">
        <Loader2 className="seo-page__spinner" />
        <span>Cargando configuración SEO…</span>
      </div>
    );
  }

  return (
    <div className="seo-page">
      <div className="seo-page__header">
        <div className="seo-page__header-text">
          <Globe className="seo-page__icon" />
          <div>
            <h1>SEO Settings</h1>
            <p>Manage your site's metadata for search engines and social sharing.</p>
          </div>
        </div>
        {saved && (
          <div className="seo-page__saved-badge">
            <CheckCircle2 size={16} /> Saved
          </div>
        )}
      </div>

      {error && (
        <div className="seo-page__error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form className="seo-form" onSubmit={handleSubmit}>

        {/* Bilingual fields */}
        {[
          { key: "title", label: "Page Title", hint: "Shown in browser tab and search results." },
          { key: "description", label: "Meta Description", hint: "Shown below the title in search results (~155 chars).", textarea: true },
          { key: "keywords", label: "Keywords", hint: "Comma-separated list of relevant keywords." },
        ].map(({ key, label, hint, textarea }) => (
          <fieldset key={key} className="seo-form__fieldset">
            <legend className="seo-form__legend">{label}</legend>
            <p className="seo-form__hint">{hint}</p>
            <div className="seo-form__lang-row">
              {["en", "es"].map((lang) => (
                <div key={lang} className="seo-form__lang-group">
                  <label className="seo-form__label">
                    <span className="seo-form__lang-badge">{lang.toUpperCase()}</span>
                    {lang === "en" ? "English" : "Spanish"}
                  </label>
                  {textarea ? (
                    <textarea
                      id={`${key}-${lang}`}
                      className="seo-form__textarea"
                      value={form[key]?.[lang] || ""}
                      onChange={(e) => handleLangChange(key, lang, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <input
                      id={`${key}-${lang}`}
                      type="text"
                      className="seo-form__input"
                      value={form[key]?.[lang] || ""}
                      onChange={(e) => handleLangChange(key, lang, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        ))}

        {/* Single-value fields */}
        <fieldset className="seo-form__fieldset">
          <legend className="seo-form__legend">Social & Sharing</legend>
          <p className="seo-form__hint">Used for Open Graph cards on social media.</p>
          <div className="seo-form__single-grid">
            <div className="seo-form__group">
              <label htmlFor="og_image" className="seo-form__label">OG Image URL</label>
              <input
                id="og_image"
                type="url"
                className="seo-form__input"
                placeholder="https://wallydev.dev/og.jpg"
                value={form.og_image || ""}
                onChange={(e) => handleChange("og_image", e.target.value)}
              />
            </div>
            <div className="seo-form__group">
              <label htmlFor="site_url" className="seo-form__label">Canonical Site URL</label>
              <input
                id="site_url"
                type="url"
                className="seo-form__input"
                placeholder="https://wallydev.dev"
                value={form.site_url || ""}
                onChange={(e) => handleChange("site_url", e.target.value)}
              />
            </div>
            <div className="seo-form__group">
              <label htmlFor="twitter_handle" className="seo-form__label">Twitter / X Handle</label>
              <input
                id="twitter_handle"
                type="text"
                className="seo-form__input"
                placeholder="@wallydevgg"
                value={form.twitter_handle || ""}
                onChange={(e) => handleChange("twitter_handle", e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <div className="seo-form__footer">
          <button type="submit" className="seo-form__save-btn" disabled={saving}>
            {saving ? <Loader2 className="seo-form__btn-icon spinning" /> : <Save className="seo-form__btn-icon" />}
            {saving ? "Guardando…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
