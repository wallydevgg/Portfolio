import { useState, useEffect } from "react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import "./Projects.scss";

export default function ProjectsPage() {
  const api = usePortfolioApi();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    tech_stack: "",
    website_link: "",
    github_link: "",
    order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = formData.image_url;
    if (imageFile) {
      setUploading(true);
      try {
        const uploadResult = await api.uploadImage(imageFile);
        imageUrl = uploadResult.url;
      } catch (err) {
        alert("Error uploading image: " + err.message);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      image_url: imageUrl,
      tech_stack: formData.tech_stack.split(",").map((t) => t.trim()),
      website_link: formData.website_link || null,
      github_link: formData.github_link || null,
      order: parseInt(formData.order),
    };

    try {
      if (editingId) {
        await api.updateProject(editingId, payload);
      } else {
        await api.createProject(payload);
      }
      await loadProjects();
      resetForm();
    } catch (err) {
      alert("Error saving project: " + err.message);
    }
  };

  const handleEdit = (proj) => {
    setEditingId(proj.id);
    setFormData({
      title: proj.title,
      description: proj.description,
      image_url: proj.image_url || "",
      tech_stack: proj.tech_stack.join(", "),
      website_link: proj.website_link || "",
      github_link: proj.github_link || "",
      order: proj.order,
    });
    setImagePreview(proj.image_url || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this project?")) {
      try {
        await api.deleteProject(id);
        await loadProjects();
      } catch (err) {
        alert("Error deleting project: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      tech_stack: "",
      website_link: "",
      github_link: "",
      order: 0,
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="projects-page">Loading...</div>;

  return (
    <div className="projects-page">
      <h1>Manage Projects</h1>

      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Project
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="project-form">
          <h2>{editingId ? "Edit Project" : "New Project"}</h2>

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
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploading}
            />
            {uploading && <small>Uploading image...</small>}
          </div>

          <div className="form-group">
            <label>Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={formData.tech_stack}
              onChange={(e) =>
                setFormData({ ...formData, tech_stack: e.target.value })
              }
              placeholder="React, FastAPI, PostgreSQL"
              required
            />
          </div>

          <div className="form-group">
            <label>Website Link (optional)</label>
            <input
              type="url"
              value={formData.website_link}
              onChange={(e) =>
                setFormData({ ...formData, website_link: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>GitHub Link (optional)</label>
            <input
              type="url"
              value={formData.github_link}
              onChange={(e) =>
                setFormData({ ...formData, github_link: e.target.value })
              }
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
            <button type="submit" className="btn-primary" disabled={uploading}>
              Save
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="projects-grid">
        {projects.map((proj) => (
          <div key={proj.id} className="project-card">
            {proj.image_url && <img src={proj.image_url} alt={proj.title} />}
            <h3>{proj.title}</h3>
            <p>{proj.description.substring(0, 100)}...</p>
            <div className="tech-tags">
              {proj.tech_stack.slice(0, 3).map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </div>
            <div className="card-actions">
              <button className="btn-small" onClick={() => handleEdit(proj)}>
                Edit
              </button>
              <button
                className="btn-small btn-danger"
                onClick={() => handleDelete(proj.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
