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
    title: "",
    responsibilities: "",
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

    const payload = {
      company: formData.company,
      date: formData.date,
      title: formData.title,
      responsibilities: formData.responsibilities
        .split("\n")
        .filter((r) => r.trim()),
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
      title: exp.title,
      responsibilities: exp.responsibilities.join("\n"),
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
      title: "",
      responsibilities: "",
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

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Responsibilities (one per line)</label>
            <textarea
              value={formData.responsibilities}
              onChange={(e) =>
                setFormData({ ...formData, responsibilities: e.target.value })
              }
              rows={6}
              required
            />
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

      <table className="experience-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Title</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {experiences.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.company}</td>
              <td>{exp.title}</td>
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
  );
}
