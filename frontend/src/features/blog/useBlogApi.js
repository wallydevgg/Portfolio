/**
 * useBlogApi — Hook para interactuar con los endpoints del blog.
 * Usa el token JWT de AuthContext para autenticar las llamadas protegidas.
 */
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = "/api/v1/posts";

export function useBlogApi() {
  const { token } = useAuth();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /**
   * Genera un slug URL-friendly a partir de un título.
   */
  const generateSlug = (title) =>
    title
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent marks
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  /**
   * Obtiene todos los posts (incluyendo borradores) para el admin.
   */
  const getAllPosts = async () => {
    const res = await fetch(`${API_BASE}/all`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Error fetching posts");
    return res.json();
  };

  /**
   * Crea un nuevo post. is_published: false = Guardar como borrador.
   */
  const createPost = async ({ title, content, is_published = false }) => {
    const slug = generateSlug(title);
    const res = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ title, content, slug, is_published }),
    });
    if (!res.ok) {
      let detail = "Error creating post";
      try { detail = (await res.json()).detail ?? detail; } catch {}
      throw new Error(detail);
    }
    return res.json();
  };

  /**
   * Actualiza un post existente por ID.
   */
  const updatePost = async (id, data) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let detail = "Error updating post";
      try { detail = (await res.json()).detail ?? detail; } catch {}
      throw new Error(detail);
    }
    return res.json();
  };

  /**
   * Elimina un post por ID.
   */
  const deletePost = async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Error deleting post");
    return true;
  };

  /**
   * Obtiene un post individual por ID.
   */
  const getPost = async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Post not found");
    return res.json();
  };

  return { getAllPosts, createPost, updatePost, deletePost, getPost, generateSlug };
}
