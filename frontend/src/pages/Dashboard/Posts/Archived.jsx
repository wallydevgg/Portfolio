import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { ArrowLeft, RotateCcw, Trash2, Loader2, Archive } from "lucide-react";
import { useBlogApi } from "@/features/blog/useBlogApi";
import { useToast } from "@/contexts/ToastContext";
import "./Posts.scss";

export default function ArchivedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const { getArchivedPosts, restorePost, purgePost } = useBlogApi();
  const toast = useToast();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setPosts(await getArchivedPosts());
    } catch {
      toast.error("No se pudieron cargar los posts archivados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRestore = async (post) => {
    try {
      setBusyId(post.id);
      await restorePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success(`"${post.title}" restaurado.`);
    } catch {
      toast.error("No se pudo restaurar el post.");
    } finally {
      setBusyId(null);
    }
  };

  const handlePurge = async (post) => {
    if (!window.confirm(`Se borrará "${post.title}" de forma definitiva. Esta acción no se puede deshacer.`)) return;
    try {
      setBusyId(post.id);
      await purgePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success("Post borrado definitivamente.");
    } catch {
      toast.error("No se pudo borrar el post.");
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="posts-page">
      <div className="posts-page__header">
        <Link to="/dashboard/posts" className="back-btn">
          <ArrowLeft className="icon" />
        </Link>
        <h1>Posts archivados</h1>
      </div>

      {loading && (
        <div className="posts-page__loading">
          <Loader2 className="icon spinning" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="posts-page__empty">
          <Archive size={40} strokeWidth={1.5} />
          <p>No hay posts archivados.</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <table className="posts-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Estado</th>
              <th>Archivado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>
                  <span className={`posts-table__status posts-table__status--${post.is_published ? "published" : "draft"}`}>
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td>{formatDate(post.deleted_at)}</td>
                <td>
                  <button onClick={() => handleRestore(post)} disabled={busyId === post.id} title="Restaurar">
                    <RotateCcw className="icon" />
                  </button>
                  <button onClick={() => handlePurge(post)} disabled={busyId === post.id} title="Borrar definitivamente">
                    <Trash2 className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
