import { useEffect, useState } from "react";
import {
  FileText,
  UploadCloud,
  Loader2,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import { useToast } from "@/contexts/ToastContext";
import "./CV.scss";

// Un CV por idioma. El botón de la portada sirve el del idioma que eligió el
// visitante, con caída al otro si ese no está subido.
const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

/**
 * Ranura de un idioma: estado actual + subida + borrado.
 *
 * El estado de subida y borrado es por ranura, no compartido: si fuera común,
 * subir el inglés bloquearía también los controles del español.
 */
function CVSlot({ language, url, onUploaded, onDeleted }) {
  const api = usePortfolioApi();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileName = url ? decodeURIComponent(url.split("/").pop()) : "";

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    event.target.value = "";
    if (!selected) return;
    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      showToast("Only PDF files are allowed", "error");
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadCV(file, language.code);
      setFile(null);
      onUploaded(language.code, result.url);
      showToast(`${language.label} CV uploaded`, "success");
    } catch {
      showToast("Failed to upload CV", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteCV(language.code);
      onDeleted(language.code);
      showToast(`${language.label} CV removed`, "success");
    } catch {
      showToast("Failed to delete CV", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`cv-slot ${url ? "has-cv" : ""}`}>
      <div className="cv-slot__head">
        <span className="cv-slot__flag" aria-hidden="true">
          {language.flag}
        </span>
        <h2>{language.label}</h2>
        {url && <CheckCircle2 size={18} className="cv-slot__ok" />}
      </div>

      {url ? (
        <div className="cv-slot__current">
          <div className="cv-slot__file">
            <div className="cv-slot__name">{fileName}</div>
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink size={12} /> Open
            </a>
          </div>
          <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <Loader2 className="spinning" size={16} />
            ) : (
              <Trash2 size={16} />
            )}
            Remove
          </button>
        </div>
      ) : (
        <p className="cv-slot__empty">
          Not uploaded. Visitors on {language.label} get the other language
          instead.
        </p>
      )}

      <div className="cv-slot__upload">
        <label className="cv-settings__file-label">
          <UploadCloud size={20} />
          <span>{file ? file.name : url ? "Replace PDF" : "Choose PDF file"}</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            hidden
          />
        </label>
        <button className="btn-save" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? (
            <Loader2 className="spinning" size={18} />
          ) : (
            <UploadCloud size={18} />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default function CVSettingsPage() {
  const api = usePortfolioApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [cvs, setCvs] = useState({ es: null, en: null });

  useEffect(() => {
    let cancelled = false;
    api
      .getCVs()
      .then((data) => {
        if (!cancelled) setCvs(data);
      })
      .catch(() => showToast("Failed to load CV status", "error"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tras subir o borrar se recarga el mapa entero: el backend decide la caída
  // al archivo antiguo, y adivinarla desde aquí sería duplicar esa regla.
  const refresh = async () => {
    try {
      setCvs(await api.getCVs());
    } catch {
      /* el toast de la ranura ya informó del fallo */
    }
  };

  if (loading) {
    return (
      <div className="cv-settings loading">
        <Loader2 className="spinning" size={24} /> Loading...
      </div>
    );
  }

  return (
    <div className="cv-settings">
      <div className="cv-settings__header">
        <div className="cv-settings__header-text">
          <FileText className="cv-settings__header-icon" />
          <div>
            <h1>Resume / CV</h1>
            <p>
              One PDF per language. The "Download CV" button on the homepage
              serves the one matching the visitor's language, and falls back to
              the other when it is missing.
            </p>
          </div>
        </div>
      </div>

      <div className="cv-settings__grid">
        {LANGUAGES.map((language) => (
          <CVSlot
            key={language.code}
            language={language}
            url={cvs[language.code]}
            onUploaded={refresh}
            onDeleted={refresh}
          />
        ))}
      </div>
    </div>
  );
}
