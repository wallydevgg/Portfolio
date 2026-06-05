import { useState, useEffect } from "react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./Skills.scss";

export default function SkillsPage() {
  const api = usePortfolioApi();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name_en: "", name_es: "", order: 0 });
  const [skillForm, setSkillForm] = useState({
    name: "",
    level: 50,
    category_id: null,
    order: 0,
  });
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await api.getSkills();
      setCategories(data.sort((a, b) => a.order - b.order));
      setExpanded(
        data.reduce((acc, cat) => {
          acc[cat.id] = true;
          return acc;
        }, {})
      );
    } catch (err) {
      console.error("Failed to load skills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createSkillCategory({
        name: { en: categoryForm.name_en, es: categoryForm.name_es },
        order: parseInt(categoryForm.order),
      });
      await loadSkills();
      setCategoryForm({ name_en: "", name_es: "", order: 0 });
      setShowCategoryForm(false);
    } catch (err) {
      alert("Error adding category: " + err.message);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (confirm("Delete this category and all its skills?")) {
      try {
        await api.deleteSkillCategory(catId);
        await loadSkills();
      } catch (err) {
        alert("Error deleting category: " + err.message);
      }
    }
  };

  const handleAddSkill = async (e, catId) => {
    e.preventDefault();
    try {
      const payload = { ...skillForm, category_id: catId };
      if (editingSkill) {
        await api.updateSkill(editingSkill, payload);
        setEditingSkill(null);
      } else {
        await api.createSkill(payload);
      }
      await loadSkills();
      setSkillForm({ name: "", level: 50, category_id: null, order: 0 });
      setShowSkillForm(null);
    } catch (err) {
      alert("Error saving skill: " + err.message);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (confirm("Delete this skill?")) {
      try {
        await api.deleteSkill(skillId);
        await loadSkills();
      } catch (err) {
        alert("Error deleting skill: " + err.message);
      }
    }
  };

  const toggleCategory = (catId) => {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (loading) return <div className="skills-page">Loading...</div>;

  return (
    <div className="skills-page">
      <h1>Manage Skills</h1>

      {!showCategoryForm && (
        <button className="btn-primary" onClick={() => setShowCategoryForm(true)}>
          + Add Category
        </button>
      )}

      {showCategoryForm && (
        <form onSubmit={handleAddCategory} className="category-form">
          <h2>New Category</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Name (English)</label>
              <input
                type="text"
                value={categoryForm.name_en}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name_en: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Name (Español)</label>
              <input
                type="text"
                value={categoryForm.name_es}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name_es: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Order</label>
            <input
              type="number"
              value={categoryForm.order}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, order: e.target.value })
              }
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowCategoryForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        {categories.map((category) => (
          <div key={category.id} className="category-item">
            <div className="category-header">
              <button
                className="expand-btn"
                onClick={() => toggleCategory(category.id)}
              >
                {expanded[category.id] ? <ChevronUp /> : <ChevronDown />}
              </button>
              <h3>{category.name?.en || ""}</h3>
              <button
                className="btn-small btn-danger"
                onClick={() => handleDeleteCategory(category.id)}
              >
                Delete
              </button>
            </div>

            {expanded[category.id] && (
              <div className="category-content">
                {showSkillForm !== category.id && (
                  <button
                    className="btn-small"
                    onClick={() => {
                      setShowSkillForm(category.id);
                      setEditingSkill(null);
                      setSkillForm({
                        name: "",
                        level: 50,
                        category_id: category.id,
                        order: 0,
                      });
                    }}
                  >
                    + Add Skill
                  </button>
                )}

                {showSkillForm === category.id && (
                  <form
                    onSubmit={(e) => handleAddSkill(e, category.id)}
                    className="skill-form"
                  >
                    <div className="form-group">
                      <label>Skill Name</label>
                      <input
                        type="text"
                        value={skillForm.name}
                        onChange={(e) =>
                          setSkillForm({ ...skillForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Level (%): {skillForm.level}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skillForm.level}
                        onChange={(e) =>
                          setSkillForm({ ...skillForm, level: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Order</label>
                      <input
                        type="number"
                        value={skillForm.order}
                        onChange={(e) =>
                          setSkillForm({ ...skillForm, order: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowSkillForm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="skills-list">
                  {category.skills
                    .sort((a, b) => a.order - b.order)
                    .map((skill) => (
                      <div key={skill.id} className="skill-item">
                        <div className="skill-info">
                          <span className="skill-name">{skill.name}</span>
                          <span className="skill-level">{skill.level}%</span>
                        </div>
                        <div className="skill-actions">
                          <button
                            className="btn-small"
                            onClick={() => {
                              setShowSkillForm(category.id);
                              setEditingSkill(skill.id);
                              setSkillForm({
                                name: skill.name,
                                level: skill.level,
                                category_id: category.id,
                                order: skill.order,
                              });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteSkill(skill.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
