import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Edit3, Trash2, Archive, Loader2, AlertCircle } from "lucide-react";
import { useBlogApi } from "../../../features/blog/useBlogApi";
import { useToast } from "../../../contexts/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import "./Posts.scss";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // { post, mode: "archive" | "purge" } o null.
  const [confirming, setConfirming] = useState(null);
  const { getAllPosts, deletePost, purgePost } = useBlogApi();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPosts();
      setPosts(data);
    } catch (err) {
      toast.error("No se pudieron cargar los posts. ¿Está el backend corriendo?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleConfirm = async () => {
    const { post, mode } = confirming;
    try {
      setDeletingId(post.id);
      if (mode === "archive") {
        await deletePost(post.id);
        toast.success(`"${post.title}" archivado.`);
      } else {
        // El backend solo purga posts ya archivados: destruir exige dos pasos
        // deliberados. Desde aquí se encadenan para no obligar a pasar por
        // Archivados, pero la invariante del servidor se respeta igual.
        await deletePost(post.id);
        await purgePost(post.id);
        toast.success(`"${post.title}" borrado definitivamente.`);
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setConfirming(null);
    } catch (err) {
      toast.error(mode === "archive" ? "Error al archivar el post." : "Error al borrar el post.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="posts-page">
      <div className="posts-page__header">
        <div>
          <h1>Blog Posts</h1>
          <p>Manage your portfolio articles here.</p>
        </div>
        <Link to="/dashboard/posts/new" className="posts-page__create-btn">
          <Plus className="icon" />
          Create Post
        </Link>
      </div>

      {error && (
        <div className="posts-page__error">
          <AlertCircle className="icon" />
          {error}
        </div>
      )}

      <div className="posts-page__table-container">
        {loading ? (
          <div className="posts-page__loading">
            <Loader2 className="icon spinning" />
            <span>Cargando posts...</span>
          </div>
        ) : (
          <table className="posts-table">
            <thead className="posts-table__head">
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="posts-table__body">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="posts-table__title-col">{post.title}</td>
                  <td>
                    <span className={`posts-table__status posts-table__status--${post.is_published ? "published" : "draft"}`}>
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{formatDate(post.created_at)}</td>
                  <td>
                    <div className="posts-table__actions">
                      <button
                        className="action-edit"
                        title="Editar post"
                        onClick={() => navigate(`/dashboard/posts/${post.id}/edit`)}
                      >
                        <Edit3 className="icon" />
                      </button>
                      <button
                        className="action-edit"
                        title="Archivar post"
                        disabled={deletingId === post.id}
                        onClick={() => setConfirming({ post, mode: "archive" })}
                      >
                        {deletingId === post.id
                          ? <Loader2 className="icon spinning" />
                          : <Archive className="icon" />
                        }
                      </button>
                      <button
                        className="action-delete"
                        title="Borrar definitivamente"
                        disabled={deletingId === post.id}
                        onClick={() => setConfirming({ post, mode: "purge" })}
                      >
                        <Trash2 className="icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="posts-table__empty">
                    No posts created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirming)}
        tone={confirming?.mode === "purge" ? "danger" : "default"}
        title={confirming?.mode === "purge" ? "Borrar definitivamente" : "Archivar post"}
        message={
          confirming?.mode === "purge"
            ? `"${confirming?.post.title}" se borrará para siempre. Esta acción no se puede deshacer.`
            : `"${confirming?.post.title}" se moverá a Archivados. Podés restaurarlo desde ahí.`
        }
        confirmLabel={confirming?.mode === "purge" ? "Borrar" : "Archivar"}
        busy={Boolean(deletingId)}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
