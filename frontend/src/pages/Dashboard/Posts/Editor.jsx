import { useState, useEffect } from "react";
import TiptapEditor from "../../../features/blog/components/TiptapEditor";
import { ArrowLeft, Save, Send, Loader2, Eye } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useBlogApi } from "../../../features/blog/useBlogApi";
import { useToast } from "../../../contexts/ToastContext";
import { useAutosave } from "@/features/blog/useAutosave";
import "./Editor.scss";

export default function PostEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Start writing your new article...</p>");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditing);
  const [isPublished, setIsPublished] = useState(false);
  const [serverUpdatedAt, setServerUpdatedAt] = useState(null);

  const { createPost, updatePost, getPost } = useBlogApi();
  const navigate = useNavigate();
  const toast = useToast();

  const { status: autosaveStatus, savedAt, recovered, discardRecovered, clearLocal } = useAutosave({
    data: { title, content },
    storageKey: `post-draft:${id ?? "new"}`,
    // Solo borradores ya creados: un post nuevo dejaría huérfanos, y uno
    // publicado se estaría editando en vivo.
    enableRemote: isEditing && !isPublished,
    onRemoteSave: ({ title, content }) => updatePost(id, { title, content }),
    serverUpdatedAt,
  });

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const post = await getPost(id);
        setTitle(post.title);
        setContent(post.content);
        setIsPublished(Boolean(post.is_published));
        setServerUpdatedAt(post.updated_at || post.created_at);
      } catch {
        toast.error("No se encontró el post.");
        navigate("/dashboard/posts");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [id]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      toast.error("El título no puede estar vacío.");
      return;
    }
    const setStatus = publish ? setPublishing : setSaving;
    try {
      setStatus(true);
      if (isEditing) {
        await updatePost(id, {
          title,
          content,
          ...(publish && { is_published: true }),
        });
        toast.success(publish ? "Post publicado correctamente." : "Cambios guardados.");
      } else {
        await createPost({ title, content, is_published: publish });
        toast.success(publish ? "Post publicado correctamente." : "Borrador guardado.");
      }
      clearLocal();
      navigate("/dashboard/posts");
    } catch (err) {
      toast.error(err.message || "Error al guardar el post.");
    } finally {
      setStatus(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="editor-page editor-page--loading">
        <Loader2 className="icon spinning" />
        <span>Cargando post...</span>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="editor-page__header">
        <div className="editor-page__title-area">
          <Link to="/dashboard/posts" className="back-btn">
            <ArrowLeft className="icon" />
          </Link>
          <h1>{isEditing ? "Edit Post" : "Create New Post"}</h1>
        </div>
        <div className="editor-page__actions">
          <span className="editor-page__autosave">
            {autosaveStatus === "saving" && "Guardando..."}
            {autosaveStatus === "saved" &&
              savedAt &&
              `Guardado ${savedAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`}
            {autosaveStatus === "error" && "Sin conexión — guardado local"}
          </span>
          {isEditing && (
            <button
              onClick={() => navigate(`/dashboard/posts/${id}/preview`)}
              disabled={saving || publishing}
              className="editor-page__save-btn"
            >
              <Eye className="icon" />
              Vista previa
            </button>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving || publishing}
            className="editor-page__save-btn"
          >
            {saving ? <Loader2 className="icon spinning" /> : <Save className="icon" />}
            {isEditing ? "Save Changes" : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || publishing}
            className="editor-page__publish-btn"
          >
            {publishing ? <Loader2 className="icon spinning" /> : <Send className="icon" />}
            {isEditing ? "Publish" : "Publish Post"}
          </button>
        </div>
      </div>

      <div className="editor-page__container">
        {recovered && (
          <div className="editor-page__recovery">
            <span>
              Tenés cambios sin guardar de las{" "}
              {new Date(recovered.savedAt).toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </span>
            <div className="editor-page__recovery-actions">
              <button
                onClick={() => {
                  setTitle(recovered.title);
                  setContent(recovered.content);
                  discardRecovered();
                }}
              >
                Recuperar
              </button>
              <button onClick={discardRecovered}>Descartar</button>
            </div>
          </div>
        )}

        <div className="editor-page__field">
          <label htmlFor="title">Post Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g., My Journey as a Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="editor-page__title-input"
          />
        </div>

        <div className="editor-page__field">
          <label>Content</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
