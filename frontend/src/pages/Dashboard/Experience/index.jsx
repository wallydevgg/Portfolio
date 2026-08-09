import { useState, useEffect } from "react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import "./Experience.scss";

export default function ExperiencePage() {
  const api = usePortfolioApi();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: "",
    date: "",
    title_en: "",
    title_es: "",
    responsibilities_en: "",
    responsibilities_es: "",
    order: 0,
  });

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const data = await api.getExperience();
      setExperiences(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Failed to load experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enLines = formData.responsibilities_en.split("\n").filter((r) => r.trim());
    const esLines = formData.responsibilities_es.split("\n").filter((r) => r.trim());
    const maxLen = Math.max(enLines.length, esLines.length);
    const responsibilities = [];
    for (let i = 0; i < maxLen; i++) {
      responsibilities.push({
        en: enLines[i] || esLines[i] || "",
        es: esLines[i] || enLines[i] || "",
      });
    }

    const payload = {
      company: formData.company,
      date: formData.date,
      title: { en: formData.title_en, es: formData.title_es },
      responsibilities,
      order: parseInt(formData.order),
    };

    try {
      if (editingId) {
        await api.updateExperience(editingId, payload);
      } else {
        await api.createExperience(payload);
      }
      await loadExperiences();
      resetForm();
    } catch (err) {
      alert("Error saving experience: " + err.message);
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setFormData({
      company: exp.company,
      date: exp.date,
      title_en: exp.title?.en || "",
      title_es: exp.title?.es || "",
      responsibilities_en: (exp.responsibilities || []).map((r) => r.en).join("\n"),
      responsibilities_es: (exp.responsibilities || []).map((r) => r.es).join("\n"),
      order: exp.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this experience?")) {
      try {
        await api.deleteExperience(id);
        await loadExperiences();
      } catch (err) {
        alert("Error deleting experience: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      company: "",
      date: "",
      title_en: "",
      title_es: "",
      responsibilities_en: "",
      responsibilities_es: "",
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="experience-page">Loading...</div>;

  return (
    <div className="experience-page">
      <h1>Manage Experience</h1>

      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Experience
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="experience-form">
          <h2>{editingId ? "Edit Experience" : "New Experience"}</h2>

          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Date (e.g., "June 2020 - 2024")</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Title (English)</label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) =>
                  setFormData({ ...formData, title_en: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Title (Español)</label>
              <input
                type="text"
                value={formData.title_es}
                onChange={(e) =>
                  setFormData({ ...formData, title_es: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Responsibilities EN (one per line)</label>
              <textarea
                value={formData.responsibilities_en}
                onChange={(e) =>
                  setFormData({ ...formData, responsibilities_en: e.target.value })
                }
                rows={6}
                required
              />
            </div>
            <div className="form-group">
              <label>Responsibilities ES (one per line)</label>
              <textarea
                value={formData.responsibilities_es}
                onChange={(e) =>
                  setFormData({ ...formData, responsibilities_es: e.target.value })
                }
                rows={6}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* El wrapper es lo que redondea y recorta: una <table> con
          border-collapse no clipa sus propias esquinas. */}
      <div className="experience-table-wrap">
      <table className="experience-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Title (EN)</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {experiences.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.company}</td>
              <td>{exp.title?.en || ""}</td>
              <td>{exp.date}</td>
              <td className="actions">
                <button
                  className="btn-small"
                  onClick={() => handleEdit(exp)}
                >
                  Edit
                </button>
                <button
                  className="btn-small btn-danger"
                  onClick={() => handleDelete(exp.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
