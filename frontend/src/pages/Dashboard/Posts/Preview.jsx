import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import PostArticle from "@/features/blog/PostArticle";
import { useBlogApi } from "@/features/blog/useBlogApi";
import { useToast } from "@/contexts/ToastContext";
import { ThemeContext } from "@/barrell";
import "@/pages/Blog/BlogPostPage.scss";
import "./Preview.scss";

export default function PostPreviewPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const { getPost, updatePost } = useBlogApi();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    (async () => {
      try {
        setPost(await getPost(id));
      } catch {
        toast.error("No se encontró el post.");
        navigate("/dashboard/posts");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await updatePost(id, { is_published: true });
      toast.success("Post publicado correctamente.");
      navigate("/dashboard/posts");
    } catch (err) {
      toast.error(err.message || "Error al publicar el post.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="preview-page__loading">
        <Loader2 className="icon spinning" />
        <span>Cargando vista previa...</span>
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <div className="preview-bar">
        <button className="preview-bar__back" onClick={() => navigate(`/dashboard/posts/${id}/edit`)}>
          <ArrowLeft size={16} /> Volver al editor
        </button>
        <span className="preview-bar__label">
          {post.is_published ? "Vista previa — post publicado" : "Vista previa — borrador sin publicar"}
        </span>
        {!post.is_published && (
          <button className="preview-bar__publish" onClick={handlePublish} disabled={publishing}>
            {publishing ? <Loader2 className="icon spinning" size={16} /> : <Send size={16} />}
            Publicar
          </button>
        )}
      </div>

      {/* El wrapper de tema lo aportan Layout y DashboardLayout, y esta página
          vive fuera de los dos. Sin él no hay ancestro .dark-theme y las reglas
          del patrón de fondo y del glass no aplican: el artículo salía sobre un
          gris plano. Se replica aquí para que la vista previa muestre lo mismo
          que la página pública. */}
      <div className={`App ${theme}-theme`}>
        <div className="blog-post-wrapper preview-page">
          <div className="blog-post">
            <PostArticle post={post} />
          </div>
        </div>
      </div>
    </>
  );
}
