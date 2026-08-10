import {
  EMBED_PROVIDERS,
  embedBox,
  embedPermalink,
  embedSrc,
  isValidEmbed,
} from "./embedProviders";

/**
 * Convierte los marcadores de embed guardados en markup real.
 *
 * En la base solo hay `<div data-embed="tiktok" data-embed-id="..."
 * data-embed-user="...">`. El iframe o el blockquote se construyen aquí, contra
 * la lista blanca, justo antes de pintar. Así el HTML almacenado nunca contiene
 * markup de terceros.
 *
 * Se usa DOMParser en vez de reemplazo por expresión regular: manipular HTML
 * con regex es precisamente como se cuelan las cosas que esto quiere evitar.
 *
 * Devuelve `{ html, scripts }` — `scripts` son los de los proveedores que
 * aparecen de verdad en este post, para no cargar nada en las páginas que no
 * los llevan.
 */
export function renderPostHtml(html) {
  if (!html) return { html: "", scripts: [] };
  if (typeof window === "undefined" || !window.DOMParser) return { html, scripts: [] };

  const doc = new DOMParser().parseFromString(html, "text/html");
  const scripts = new Set();

  doc.querySelectorAll("div[data-embed]").forEach((marker) => {
    const provider = marker.getAttribute("data-embed");
    const id = marker.getAttribute("data-embed-id");
    const user = marker.getAttribute("data-embed-user");
    const config = EMBED_PROVIDERS[provider];

    if (!config || !isValidEmbed(provider, id, user)) {
      marker.remove();
      return;
    }

    if (config.type === "iframe") {
      marker.replaceWith(buildIframe(doc, provider, id, user, config));
      return;
    }

    const wrapped = buildBlockquote(doc, provider, id, user, config);
    if (!wrapped) {
      marker.remove();
      return;
    }
    marker.replaceWith(wrapped);
    if (config.script) scripts.add(config.script);
  });

  return { html: doc.body.innerHTML, scripts: [...scripts] };
}

function buildIframe(doc, provider, id, user, config) {
  const { ratio, maxWidth } = embedBox(provider, user);

  const figure = doc.createElement("figure");
  figure.className = `post-embed post-embed--${provider}`;
  figure.style.aspectRatio = ratio;
  if (maxWidth) figure.style.maxWidth = maxWidth;

  const iframe = doc.createElement("iframe");
  // Todos los valores salen de la lista blanca; nada viene del post.
  iframe.setAttribute("src", embedSrc(provider, id));
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("allow", config.allow);
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("title", `${config.label} embed`);

  figure.appendChild(iframe);
  return figure;
}

/**
 * Reproduce la forma del snippet oficial, que es lo que su script busca en el
 * DOM: `.tiktok-embed[data-video-id]` e `.instagram-media[data-instgrm-permalink]`.
 *
 * Dentro va un enlace al contenido original: si el script no llega a cargar, en
 * lugar de un hueco queda algo en lo que se puede pulsar.
 */
function buildBlockquote(doc, provider, id, user, config) {
  const permalink = embedPermalink(provider, id, user);
  if (!permalink) return null;

  // El blockquote va dentro de un contenedor nuestro porque su script lo
  // sustituye por su propio elemento, y con él se lleva los anchos que le
  // pongamos: el fondo claro del reproductor acababa ocupando todo el ancho del
  // artículo. El contenedor sí sobrevive y es quien limita la caja.
  const wrap = doc.createElement("div");
  wrap.className = `post-embed-wrap post-embed-wrap--${provider}`;
  if (config.maxWidth) wrap.style.maxWidth = config.maxWidth;
  if (config.minWidth) wrap.style.minWidth = config.minWidth;

  const quote = doc.createElement("blockquote");
  quote.className = `post-embed post-embed--${provider}`;
  // Sin aspect-ratio: el script del proveedor decide la altura del reproductor
  // y fijarla desde fuera lo recortaría.

  if (provider === "tiktok") {
    quote.classList.add("tiktok-embed");
    quote.setAttribute("cite", permalink);
    quote.setAttribute("data-video-id", id);
  } else {
    quote.classList.add("instagram-media");
    quote.setAttribute("data-instgrm-permalink", permalink);
    quote.setAttribute("data-instgrm-version", "14");
  }

  const link = doc.createElement("a");
  link.setAttribute("href", permalink);
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
  link.textContent = `Ver en ${config.label}`;

  const section = doc.createElement("section");
  section.appendChild(link);
  quote.appendChild(section);

  wrap.appendChild(quote);
  return wrap;
}
