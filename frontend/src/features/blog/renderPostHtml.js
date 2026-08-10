import {
  EMBED_PROVIDERS,
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
      marker.replaceWith(buildIframe(doc, provider, id, config));
      return;
    }

    const blockquote = buildBlockquote(doc, provider, id, user, config);
    if (!blockquote) {
      marker.remove();
      return;
    }
    marker.replaceWith(blockquote);
    if (config.script) scripts.add(config.script);
  });

  return { html: doc.body.innerHTML, scripts: [...scripts] };
}

function buildIframe(doc, provider, id, config) {
  const figure = doc.createElement("figure");
  figure.className = `post-embed post-embed--${provider}`;
  figure.style.aspectRatio = config.ratio;
  if (config.maxWidth) figure.style.maxWidth = config.maxWidth;

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

  const quote = doc.createElement("blockquote");
  quote.className = `post-embed post-embed--${provider}`;
  if (config.maxWidth) quote.style.maxWidth = config.maxWidth;

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

  return quote;
}
