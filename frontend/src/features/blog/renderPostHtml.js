import { EMBED_PROVIDERS, embedSrc } from "./embedProviders";

/**
 * Convierte los marcadores de embed guardados en iframes reales.
 *
 * En la base solo hay `<div data-embed="youtube" data-embed-id="...">`. El
 * iframe se construye aquí, contra la lista blanca de proveedores, justo antes
 * de pintar. Así el HTML almacenado nunca contiene markup de terceros y una URL
 * pegada no puede acabar siendo markup arbitrario.
 *
 * Se usa DOMParser en vez de reemplazo por expresión regular: manipular HTML
 * con regex es precisamente como se cuelan las cosas que esto quiere evitar.
 *
 * Un embed que no pase la validación se descarta — no se pinta nada.
 */
export function renderPostHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined" || !window.DOMParser) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const markers = doc.querySelectorAll("div[data-embed]");

  markers.forEach((marker) => {
    const provider = marker.getAttribute("data-embed");
    const id = marker.getAttribute("data-embed-id");
    const src = embedSrc(provider, id);

    if (!src) {
      marker.remove();
      return;
    }

    const config = EMBED_PROVIDERS[provider];

    const figure = doc.createElement("figure");
    figure.className = `post-embed post-embed--${provider}`;
    figure.style.aspectRatio = config.ratio;
    if (config.maxWidth) figure.style.maxWidth = config.maxWidth;

    const iframe = doc.createElement("iframe");
    // setAttribute con valores de la lista blanca: nada aquí viene del post.
    iframe.setAttribute("src", src);
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allow", config.allow);
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("title", `${config.label} embed`);

    figure.appendChild(iframe);
    marker.replaceWith(figure);
  });

  return doc.body.innerHTML;
}
