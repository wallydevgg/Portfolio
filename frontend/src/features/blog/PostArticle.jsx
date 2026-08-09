import { Calendar, Tag } from "lucide-react";
import { renderPostHtml } from "./renderPostHtml";
import { POST_COVER_FALLBACK } from "./coverImage";

/**
 * Render puro de un post. Sin fetch ni estado: lo usan tanto la página pública
 * del blog como la previsualización del dashboard, y las dos tienen que ver
 * exactamente lo mismo.
 *
 * `children` se coloca dentro del <article>, al final: ahí es donde la página
 * pública mete la barra de like y compartir, que la preview no tiene.
 */
export default function PostArticle({ post, children }) {
  return (
    <article className="blog-post__article">
      <img
        className="blog-post__cover"
        src={post.cover_image || POST_COVER_FALLBACK}
        alt=""
        loading="lazy"
      />

      <div className="blog-post__tags">
        {post.category && (
          <span className="blog-post__tag blog-post__tag--category">
            <Tag size={11} />
            {post.category.name}
          </span>
        )}
        {post.tags && post.tags.map((tag) => (
          <span key={tag.id || tag.name} className="blog-post__tag">
            #{tag.name || tag}
          </span>
        ))}
      </div>

      <h1 className="blog-post__title">{post.title}</h1>

      <div className="blog-post__meta">
        <span>
          <Calendar size={13} />
          {new Date(post.created_at).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* renderPostHtml convierte los marcadores data-embed en iframes contra
          la lista blanca de proveedores. El HTML guardado no trae markup de
          terceros, así que esto es lo único que los materializa. */}
      <div
        className="blog-post__content"
        dangerouslySetInnerHTML={{ __html: renderPostHtml(post.content) }}
      />

      {children}
    </article>
  );
}
