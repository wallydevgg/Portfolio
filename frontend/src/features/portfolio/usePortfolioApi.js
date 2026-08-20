import { useAuth } from "@/contexts/AuthContext";

const BASE_URL = "/api/v1/portfolio";

export function usePortfolioApi() {
  const { token } = useAuth();

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // === EXPERIENCE ===

  async function getExperience() {
    const res = await fetch(`${BASE_URL}/experience`);
    if (!res.ok) throw new Error("Failed to fetch experience");
    return res.json();
  }

  async function createExperience(data) {
    const res = await fetch(`${BASE_URL}/experience`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create experience");
    return res.json();
  }

  async function updateExperience(id, data) {
    const res = await fetch(`${BASE_URL}/experience/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update experience");
    return res.json();
  }

  async function deleteExperience(id) {
    const res = await fetch(`${BASE_URL}/experience/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete experience");
    return true;
  }

  // === SKILL CATEGORIES ===

  async function getSkills() {
    const res = await fetch(`${BASE_URL}/skills`);
    if (!res.ok) throw new Error("Failed to fetch skills");
    return res.json();
  }

  async function createSkillCategory(data) {
    const res = await fetch(`${BASE_URL}/skills/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create skill category");
    return res.json();
  }

  async function updateSkillCategory(id, data) {
    const res = await fetch(`${BASE_URL}/skills/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update skill category");
    return res.json();
  }

  async function deleteSkillCategory(id) {
    const res = await fetch(`${BASE_URL}/skills/categories/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete skill category");
    return true;
  }

  // === SKILLS ===

  async function createSkill(data) {
    const res = await fetch(`${BASE_URL}/skills/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create skill");
    return res.json();
  }

  async function updateSkill(id, data) {
    const res = await fetch(`${BASE_URL}/skills/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update skill");
    return res.json();
  }

  async function deleteSkill(id) {
    const res = await fetch(`${BASE_URL}/skills/items/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete skill");
    return true;
  }

  // === PROJECTS ===

  async function getProjects() {
    const res = await fetch(`${BASE_URL}/projects`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  }

  async function createProject(data) {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  }

  async function updateProject(id, data) {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update project");
    return res.json();
  }

  async function deleteProject(id) {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete project");
    return true;
  }

  // === UPLOAD ===

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload image");
    return res.json();
  }

  // === CV ===

  async function uploadCV(file, lang) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/cv/${lang}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload CV");
    return res.json();
  }

  /** { es: url|null, en: url|null }. Nunca 404: si no hay ninguno, van los dos a null. */
  async function getCVs() {
    const res = await fetch(`${BASE_URL}/cv`);
    if (!res.ok) throw new Error("Failed to fetch CV");
    return res.json();
  }

  async function deleteCV(lang) {
    const res = await fetch(`${BASE_URL}/cv/${lang}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error("Failed to delete CV");
    return true;
  }

  // === ABOUT ===
  async function getAbout() {
    const res = await fetch(`${BASE_URL}/about`);
    if (!res.ok) throw new Error("Failed to fetch about settings");
    return res.json();
  }

  async function updateAbout(data) {
    const res = await fetch(`${BASE_URL}/about`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update about settings");
    return res.json();
  }

  return {
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience,
    getSkills,
    createSkillCategory,
    updateSkillCategory,
    deleteSkillCategory,
    createSkill,
    updateSkill,
    deleteSkill,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    uploadImage,
    uploadCV,
    getCVs,
    deleteCV,
    getAbout,
    updateAbout,
  };
}
