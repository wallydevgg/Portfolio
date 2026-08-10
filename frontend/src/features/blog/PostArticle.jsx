import { useEffect, useMemo } from "react";
import { Calendar, Tag } from "lucide-react";
import { renderPostHtml } from "./renderPostHtml";
import { POST_COVER_FALLBACK } from "./coverImage";

/**
 * Carga los scripts de embed que este post necesita, y solo esos.
 *
 * TikTok e Instagram no se dejan meter en un iframe: publican un snippet
 * público —sin clave— y un script que convierte el blockquote en el embed real.
 * Es el único código de terceros del blog, así que se carga bajo demanda: una
 * entrada sin ese tipo de vídeo no descarga nada.
 *
 * Si el script ya estaba en la página (al navegar entre posts), se le pide que
 * vuelva a recorrer el DOM en lugar de añadirlo otra vez.
 */
function useEmbedScripts(scripts) {
  useEffect(() => {
    if (!scripts.length) return;

    scripts.forEach((src) => {
      const yaEsta = document.querySelector(`script[src="${src}"]`);

      if (yaEsta) {
        if (src.includes("instagram") && window.instgrm?.Embeds) {
          window.instgrm.Embeds.process();
        }
        return;
      }

      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      document.body.appendChild(el);
    });
  }, [scripts]);
}

/**
 * Render puro de un post. Sin fetch ni estado: lo usan tanto la página pública
 * del blog como la previsualización del dashboard, y las dos tienen que ver
 * exactamente lo mismo.
 *
 * `children` se coloca dentro del <article>, al final: ahí es donde la página
 * pública mete la barra de like y compartir, que la preview no tiene.
 */
export default function PostArticle({ post, children }) {
  const { html, scripts } = useMemo(() => renderPostHtml(post.content), [post.content]);
  useEmbedScripts(scripts);

  return (
    <article className="blog-post__article">
      <img
        className="blog-post__cover"
        src={post.cover_image || POST_COVER_FALLBACK}
        alt=""
        loading="lazy"
      />

      {/* Todo lo que no es la portada vive aquí, y este wrapper es quien lleva
          el padding. Así la portada llega a los bordes del panel sin márgenes
          negativos calculados desde el padding del contenedor. */}
      <div className="blog-post__article-inner">
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
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {children}
      </div>
    </article>
  );
}
