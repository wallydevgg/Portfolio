import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Edit3, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useBlogApi } from "../../../features/blog/useBlogApi";
import { useToast } from "../../../contexts/ToastContext";
import "./Posts.scss";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { getAllPosts, deletePost } = useBlogApi();
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

  const handleDelete = async (post) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${post.title}"?`)) return;
    try {
      setDeletingId(post.id);
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      toast.error("Error al eliminar el post.");
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
                        className="action-delete"
                        title="Eliminar post"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post)}
                      >
                        {deletingId === post.id
                          ? <Loader2 className="icon spinning" />
                          : <Trash2 className="icon" />
                        }
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
    </div>
  );
}
