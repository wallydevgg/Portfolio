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

export default function CVSettingsPage() {
  const api = usePortfolioApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cvUrl, setCvUrl] = useState(null);
  const [cvFileName, setCvFileName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadCV();
  }, []);

  const loadCV = async () => {
    try {
      const data = await api.getCV();
      if (data) {
        setCvUrl(data.url);
        setCvFileName(data.url.split("/").pop());
      }
    } catch (err) {
      showToast("Failed to load CV status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are allowed", "error");
      return;
    }
    setFile(selected);
    setCvFileName(selected.name);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast("Select a PDF file first", "error");
      return;
    }
    setUploading(true);
    try {
      const result = await api.uploadCV(file);
      setCvUrl(result.url);
      setFile(null);
      showToast("CV uploaded successfully", "success");
    } catch (err) {
      showToast("Failed to upload CV", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!cvUrl) return;
    setDeleting(true);
    try {
      await api.deleteCV();
      setCvUrl(null);
      setCvFileName("");
      showToast("CV removed", "success");
    } catch (err) {
      showToast("Failed to delete CV", "error");
    } finally {
      setDeleting(false);
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
            <p>Upload the PDF shown by the "Download CV" button on the homepage.</p>
          </div>
        </div>
      </div>

      {/* Current CV status */}
      <div className={`cv-settings__card ${cvUrl ? "has-cv" : ""}`}>
        <h2>Current CV</h2>
        {cvUrl ? (
          <div className="cv-settings__current">
            <div className="cv-settings__current-file">
              <CheckCircle2 size={20} className="cv-settings__current-icon" />
              <div>
                <div className="cv-settings__current-name">{cvFileName}</div>
                <a href={cvUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={12} /> Open
                </a>
              </div>
            </div>
            <button
              className="btn-delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="spinning" size={16} />
              ) : (
                <Trash2 size={16} />
              )}
              Remove
            </button>
          </div>
        ) : (
          <p className="cv-settings__empty">
            No CV uploaded yet. The download button on the homepage is disabled
            until you upload one.
          </p>
        )}
      </div>

      {/* Upload new CV */}
      <div className="cv-settings__card">
        <h2>Upload new CV</h2>
        <p className="cv-settings__desc">
          Replacing the file keeps the same public URL, so the homepage button
          keeps working.
        </p>

        <div className="cv-settings__upload">
          <label className="cv-settings__file-label">
            <UploadCloud size={22} />
            <span>{file ? file.name : "Choose PDF file"}</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              hidden
            />
          </label>
          <button
            className="btn-save"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <Loader2 className="spinning" size={18} />
            ) : (
              <UploadCloud size={18} />
            )}
            {uploading ? "Uploading..." : "Upload CV"}
          </button>
        </div>
      </div>
    </div>
  );
}
