import { useEffect, useState } from "react";
import { UserRound, Save, Loader2, Image as ImageIcon, X, LayoutTemplate } from "lucide-react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import { useToast } from "@/contexts/ToastContext";
import "./About.scss";

export default function AboutDashboardPage() {
  const api = usePortfolioApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    text: { en: "", es: "" },
    image_url: "",
    layout: "text-left",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      const data = await api.getAbout();
      setFormData({
        text: data.text || { en: "", es: "" },
        image_url: data.image_url || "",
        layout: data.layout || "text-left",
      });
      setImagePreview(data.image_url || "");
    } catch (err) {
      showToast("Failed to load About settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image_url: "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = formData.image_url;

      if (imageFile) {
        setUploading(true);
        const uploadResult = await api.uploadImage(imageFile);
        finalImageUrl = uploadResult.url;
        setUploading(false);
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl,
      };

      await api.updateAbout(payload);
      showToast("About section updated successfully", "success");
      
      // Update local state to reflect saved image URL
      if (imageFile) {
        setImageFile(null);
        setFormData(prev => ({ ...prev, image_url: finalImageUrl }));
      }
    } catch (err) {
      showToast("Failed to save About settings", "error");
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="about-dashboard loading">
        <Loader2 className="spinning" size={24} /> Loading...
      </div>
    );
  }

  return (
    <div className="about-dashboard">
      <div className="about-dashboard__header">
        <div className="about-dashboard__header-text">
          <UserRound className="about-dashboard__header-icon" />
          <div>
            <h1>About Section</h1>
            <p>Manage your professional summary, photo, and layout.</p>
          </div>
        </div>
        <button 
          className="btn-save" 
          onClick={handleSave} 
          disabled={saving || uploading}
        >
          {saving || uploading ? <Loader2 className="spinning" size={18} /> : <Save size={18} />}
          {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="about-dashboard__content">
        {/* Text Content */}
        <div className="about-card">
          <h2>Text Content</h2>
          <p className="about-card__desc">
            Use blank lines to separate paragraphs.
          </p>
          
          <div className="form-group">
            <label>English</label>
            <textarea
              rows={8}
              value={formData.text.en}
              onChange={(e) => setFormData({
                ...formData,
                text: { ...formData.text, en: e.target.value }
              })}
              placeholder="Hi, I'm Waldir..."
            />
          </div>
          
          <div className="form-group">
            <label>Spanish</label>
            <textarea
              rows={8}
              value={formData.text.es}
              onChange={(e) => setFormData({
                ...formData,
                text: { ...formData.text, es: e.target.value }
              })}
              placeholder="Hola, soy Waldir..."
            />
          </div>
        </div>

        {/* Image & Layout */}
        <div className="about-sidebar">
          <div className="about-card">
            <h2>Photo</h2>
            <div className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button className="btn-remove-image" onClick={handleRemoveImage}>
                    <X size={16} /> Remove
                  </button>
                </div>
              ) : (
                <label className="image-upload-placeholder">
                  <ImageIcon size={32} />
                  <span>Click to upload photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              )}
            </div>
          </div>

          <div className="about-card">
            <h2>Layout</h2>
            <p className="about-card__desc">How the image and text are arranged on desktop.</p>
            
            <div className="layout-options">
              <label className={`layout-option ${formData.layout === "text-left" ? "active" : ""}`}>
                <input 
                  type="radio" 
                  name="layout" 
                  value="text-left" 
                  checked={formData.layout === "text-left"}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                  hidden
                />
                <div className="layout-diagram row">
                  <div className="diagram-text"></div>
                  <div className="diagram-img"></div>
                </div>
                <span>Text Left</span>
              </label>

              <label className={`layout-option ${formData.layout === "text-right" ? "active" : ""}`}>
                <input 
                  type="radio" 
                  name="layout" 
                  value="text-right" 
                  checked={formData.layout === "text-right"}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                  hidden
                />
                <div className="layout-diagram row-reverse">
                  <div className="diagram-text"></div>
                  <div className="diagram-img"></div>
                </div>
                <span>Text Right</span>
              </label>

              <label className={`layout-option ${formData.layout === "text-top" ? "active" : ""}`}>
                <input 
                  type="radio" 
                  name="layout" 
                  value="text-top" 
                  checked={formData.layout === "text-top"}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                  hidden
                />
                <div className="layout-diagram col">
                  <div className="diagram-text"></div>
                  <div className="diagram-img"></div>
                </div>
                <span>Text Top</span>
              </label>

              <label className={`layout-option ${formData.layout === "text-bottom" ? "active" : ""}`}>
                <input 
                  type="radio" 
                  name="layout" 
                  value="text-bottom" 
                  checked={formData.layout === "text-bottom"}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                  hidden
                />
                <div className="layout-diagram col-reverse">
                  <div className="diagram-text"></div>
                  <div className="diagram-img"></div>
                </div>
                <span>Text Bottom</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
