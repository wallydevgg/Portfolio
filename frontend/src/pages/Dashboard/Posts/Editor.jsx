import { useState, useEffect, useRef } from "react";
import TiptapEditor from "../../../features/blog/components/TiptapEditor";
import { ArrowLeft, Save, Send, Loader2, Eye, ImagePlus, FileText, Archive } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Link, useNavigate, useParams } from "react-router";
import { useBlogApi } from "../../../features/blog/useBlogApi";
import { useToast } from "../../../contexts/ToastContext";
import { useAutosave } from "@/features/blog/useAutosave";
import { POST_COVER_FALLBACK } from "@/features/blog/coverImage";
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
  const [coverImage, setCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const coverInputRef = useRef(null);

  const { createPost, updatePost, getPost, uploadImage, deletePost } = useBlogApi();
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
        setCoverImage(post.cover_image || "");
      } catch {
        toast.error("No se encontró el post.");
        navigate("/dashboard/posts");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [id]);

  const handleCoverPicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploadingCover(true);
      const { url } = await uploadImage(file);
      setCoverImage(url);
    } catch (err) {
      toast.error(err.message || "No se pudo subir la portada.");
    } finally {
      setUploadingCover(false);
    }
  };

  /**
   * `publish`: true publica, false despublica (deja el post como borrador) y
   * undefined guarda sin tocar el estado de publicación.
   *
   * Devuelve true si guardó, para que la vista previa pueda encadenar.
   */
  const persist = async ({ publish, silent = false } = {}) => {
    if (!title.trim()) {
      toast.error("El título no puede estar vacío.");
      return false;
    }
    const campos = {
      title,
      content,
      cover_image: coverImage || null,
      ...(publish !== undefined && { is_published: publish }),
    };

    if (isEditing) {
      await updatePost(id, campos);
      if (!silent) {
        toast.success(
          publish === true ? "Post publicado correctamente."
          : publish === false ? "Post pasado a borrador."
          : "Cambios guardados."
        );
      }
      if (publish !== undefined) setIsPublished(publish);
      clearLocal();
      return true;
    }

    const creado = await createPost({ ...campos, is_published: publish === true });
    if (!silent) toast.success(publish === true ? "Post publicado correctamente." : "Borrador guardado.");
    clearLocal();
    return creado;
  };

  const handleSave = async (publish) => {
    const setStatus = publish === true ? setPublishing : setSaving;
    try {
      setStatus(true);
      const ok = await persist({ publish });
      if (ok) navigate("/dashboard/posts");
    } catch (err) {
      toast.error(err.message || "Error al guardar el post.");
    } finally {
      setStatus(false);
    }
  };

  /**
   * La vista previa lee el post del servidor, así que lo que no se ha guardado
   * —imágenes y embeds recién insertados— no aparecía. Se guarda antes de
   * abrirla, sin cambiar el estado de publicación.
   */
  const handlePreview = async () => {
    try {
      setSaving(true);
      const guardado = await persist({ silent: true });
      if (!guardado) return;
      const destino = isEditing ? id : guardado.id;
      navigate(`/dashboard/posts/${destino}/preview`);
    } catch (err) {
      toast.error(err.message || "No se pudo guardar antes de la vista previa.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      setArchiving(true);
      await deletePost(id);
      clearLocal();
      toast.success("Post archivado.");
      navigate("/dashboard/posts");
    } catch (err) {
      toast.error(err.message || "No se pudo archivar el post.");
    } finally {
      setArchiving(false);
      setConfirmArchive(false);
    }
  };

  const ocupado = saving || publishing || archiving;

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
          {/* La barra depende del estado del post: a uno ya publicado no se le
              ofrece Publicar, sino guardar cambios o devolverlo a borrador. */}
          <button
            onClick={handlePreview}
            disabled={ocupado}
            className="editor-page__save-btn"
            title="Guarda y abre la vista previa"
          >
            <Eye className="icon" />
            Vista previa
          </button>

          <button
            onClick={() => handleSave(undefined)}
            disabled={ocupado}
            className={isPublished ? "editor-page__publish-btn" : "editor-page__save-btn"}
          >
            {saving ? <Loader2 className="icon spinning" /> : <Save className="icon" />}
            {isEditing ? "Save Changes" : "Save Draft"}
          </button>

          {isPublished ? (
            <button
              onClick={() => handleSave(false)}
              disabled={ocupado}
              className="editor-page__save-btn"
              title="Quita el post del blog público y lo deja como borrador"
            >
              <FileText className="icon" />
              Save as Draft
            </button>
          ) : (
            <button
              onClick={() => handleSave(true)}
              disabled={ocupado}
              className="editor-page__publish-btn"
            >
              {publishing ? <Loader2 className="icon spinning" /> : <Send className="icon" />}
              {isEditing ? "Publish" : "Publish Post"}
            </button>
          )}

          {isEditing && (
            <button
              onClick={() => setConfirmArchive(true)}
              disabled={ocupado}
              className="editor-page__save-btn"
              title="Mover a Archivados"
            >
              {archiving ? <Loader2 className="icon spinning" /> : <Archive className="icon" />}
              Archive
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        title="Archivar post"
        message={`"${title}" se moverá a Archivados. Podés restaurarlo desde ahí.`}
        confirmLabel="Archivar"
        busy={archiving}
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(false)}
      />

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
          <label>Cover Image</label>
          <div className="editor-page__cover">
            <img
              className="editor-page__cover-preview"
              src={coverImage || POST_COVER_FALLBACK}
              alt=""
            />
            <div className="editor-page__cover-actions">
              <p>
                {coverImage
                  ? "Se usa como portada en el listado y en el post."
                  : "Sin portada: se usa la imagen por defecto."}
              </p>
              <div>
                <button
                  type="button"
                  className="editor-page__save-btn"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                >
                  {uploadingCover ? <Loader2 className="icon spinning" /> : <ImagePlus className="icon" />}
                  {coverImage ? "Cambiar" : "Subir portada"}
                </button>
                {coverImage && (
                  <button
                    type="button"
                    className="editor-page__save-btn"
                    onClick={() => setCoverImage("")}
                    disabled={uploadingCover}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            hidden
            onChange={handleCoverPicked}
          />
        </div>

        <div className="editor-page__field">
          <label>Content</label>
          <TiptapEditor content={content} onChange={setContent} onError={toast.error} />
        </div>
      </div>
    </div>
  );
}
