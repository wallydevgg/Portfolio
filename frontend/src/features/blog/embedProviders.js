/**
 * Proveedores de embed permitidos.
 *
 * En la base NUNCA se guarda el markup del proveedor: se guarda el par
 * (provider, id) — más el usuario en TikTok — y el markup se construye aquí, en
 * tiempo de render. Con eso, pegar una URL no puede convertirse en HTML
 * arbitrario dentro del post, que se pinta con dangerouslySetInnerHTML.
 *
 * Hay dos formas de incrustar:
 *
 * - `iframe`: YouTube. Se deja embeber directamente, sin nada de terceros.
 * - `blockquote`: TikTok e Instagram. Rechazan el iframe directo, pero publican
 *   un snippet de embed público —sin clave ni app— que consiste en un
 *   blockquote con datos y un script suyo que lo hidrata. Construimos ese
 *   blockquote nosotros a partir de valores validados; lo único de ellos es el
 *   script, y se carga solo en las páginas que llevan ese proveedor.
 */

// Un id válido nunca lleva comillas, < ni >. Última línea de defensa antes de
// interpolar en HTML.
const SAFE_ID = /^[A-Za-z0-9_.-]+$/;

export const EMBED_PROVIDERS = {
  youtube: {
    label: "YouTube",
    type: "iframe",
    match: [
      /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ],
    // Los shorts son verticales, así que se reconocen aparte para poder darles
    // su proporción: con 16/9 quedaban con dos franjas negras enormes.
    verticalMatch: [/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/],
    // nocookie: no deja cookies de seguimiento hasta que se pulsa play.
    src: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
    ratio: "16 / 9",
    verticalRatio: "9 / 16",
    verticalMaxWidth: "400px",
    allow: "accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share",
  },

  tiktok: {
    label: "TikTok",
    type: "blockquote",
    script: "https://www.tiktok.com/embed.js",
    // El usuario se captura porque el snippet oficial lo lleva en el cite.
    match: [/tiktok\.com\/@([A-Za-z0-9_.]+)\/video\/(\d+)/],
    userGroup: 1,
    idGroup: 2,
    // El snippet oficial admite hasta 605px, pero el vídeo es vertical: a ese
    // ancho el reproductor deja bandas blancas a los lados. 325px es el mínimo
    // que TikTok declara y es el que se ajusta al vídeo.
    maxWidth: "325px",
  },

  instagram: {
    label: "Instagram",
    type: "blockquote",
    script: "https://www.instagram.com/embed.js",
    // Posts y reels comparten shortcode; el permalink conserva el tipo.
    match: [/instagram\.com\/(p|reel|reels)\/([A-Za-z0-9_-]+)/],
    kindGroup: 1,
    idGroup: 2,
    maxWidth: "540px",
  },
};

/**
 * Reconoce una URL y devuelve { provider, id, user }, o null si no la cubre
 * ningún proveedor.
 */
export function parseEmbedUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  for (const [provider, config] of Object.entries(EMBED_PROVIDERS)) {
    // Los verticales se comprueban primero: un short también encajaría en el
    // patrón genérico si este fuera menos estricto.
    for (const pattern of config.verticalMatch ?? []) {
      const found = trimmed.match(pattern);
      if (found) return { provider, id: found[1], user: "short" };
    }

    for (const pattern of config.match) {
      const found = trimmed.match(pattern);
      if (!found) continue;

      const id = found[config.idGroup ?? 1];
      // En Instagram el "usuario" guarda el tipo de permalink (p / reel), que
      // es lo que hace falta para reconstruir la URL.
      const user =
        config.userGroup ? found[config.userGroup]
        : config.kindGroup ? found[config.kindGroup]
        : null;

      return { provider, id, user };
    }
  }
  return null;
}

/** true si los valores son seguros de interpolar. */
export function isValidEmbed(provider, id, user = null) {
  const config = EMBED_PROVIDERS[provider];
  if (!config || !id || !SAFE_ID.test(id)) return false;
  if (user !== null && user !== "" && !SAFE_ID.test(user)) return false;
  return true;
}

/** src del iframe para los proveedores de tipo iframe, o null. */
export function embedSrc(provider, id, user = null) {
  const config = EMBED_PROVIDERS[provider];
  if (!config || config.type !== "iframe" || !isValidEmbed(provider, id, user)) return null;
  return config.src(id);
}

/** URL canónica del contenido, para el enlace de respaldo del blockquote. */
export function embedPermalink(provider, id, user) {
  if (!isValidEmbed(provider, id, user)) return null;
  if (provider === "tiktok") return `https://www.tiktok.com/@${user}/video/${id}`;
  if (provider === "instagram") {
    const kind = user === "reel" || user === "reels" ? "reel" : "p";
    return `https://www.instagram.com/${kind}/${id}/`;
  }
  return null;
}

/**
 * Proporción y ancho del contenedor. Un short de YouTube es vertical y usa los
 * suyos; el resto, los del proveedor.
 */
export function embedBox(provider, user) {
  const config = EMBED_PROVIDERS[provider];
  if (!config) return { ratio: null, maxWidth: null };

  const vertical = user === "short";
  return {
    ratio: vertical ? config.verticalRatio : config.ratio,
    maxWidth: vertical ? config.verticalMaxWidth : config.maxWidth,
  };
}

/** Script que hay que cargar para hidratar este proveedor, o null. */
export function embedScript(provider) {
  return EMBED_PROVIDERS[provider]?.script ?? null;
}
