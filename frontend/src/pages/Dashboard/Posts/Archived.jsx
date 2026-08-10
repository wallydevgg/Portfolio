import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { ArrowLeft, RotateCcw, FileText, Trash2, Loader2, Archive } from "lucide-react";
import { useBlogApi } from "@/features/blog/useBlogApi";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import "./Posts.scss";

export default function ArchivedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [purging, setPurging] = useState(null);
  const { getArchivedPosts, restorePost, purgePost, updatePost } = useBlogApi();
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

  /**
   * Restaurar devuelve el post al estado que tenía. Con `comoBorrador` además
   * lo despublica, que es lo que hace falta para retocar algo archivado sin que
   * vuelva de golpe al blog público.
   */
  const handleRestore = async (post, comoBorrador = false) => {
    try {
      setBusyId(post.id);
      await restorePost(post.id);
      if (comoBorrador && post.is_published) {
        await updatePost(post.id, { is_published: false });
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success(
        comoBorrador ? `"${post.title}" restaurado como borrador.` : `"${post.title}" restaurado.`
      );
    } catch {
      toast.error("No se pudo restaurar el post.");
    } finally {
      setBusyId(null);
    }
  };

  const handlePurge = async () => {
    const post = purging;
    try {
      setBusyId(post.id);
      await purgePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setPurging(null);
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
        <div className="posts-page__empty-state">
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
                  <div className="posts-table__actions">
                    <button
                      onClick={() => handleRestore(post)}
                      disabled={busyId === post.id}
                      className="action-edit"
                      title={post.is_published ? "Restaurar como publicado" : "Restaurar"}
                    >
                      <RotateCcw className="icon" />
                    </button>
                    {post.is_published && (
                      <button
                        onClick={() => handleRestore(post, true)}
                        disabled={busyId === post.id}
                        className="action-edit"
                        title="Restaurar como borrador"
                      >
                        <FileText className="icon" />
                      </button>
                    )}
                    <button
                      onClick={() => setPurging(post)}
                      disabled={busyId === post.id}
                      className="action-delete"
                      title="Borrar definitivamente"
                    >
                      <Trash2 className="icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={Boolean(purging)}
        tone="danger"
        title="Borrar definitivamente"
        message={`"${purging?.title}" se borrará para siempre. Esta acción no se puede deshacer.`}
        confirmLabel="Borrar"
        busy={Boolean(busyId)}
        onConfirm={handlePurge}
        onCancel={() => setPurging(null)}
      />
    </div>
  );
}
