/**
 * Proveedores de embed permitidos.
 *
 * El contenido del post se pinta con dangerouslySetInnerHTML, así que en la base
 * NUNCA se guarda el markup del proveedor: se guarda el par (provider, id) y el
 * iframe se construye aquí, en tiempo de render, desde esta lista.
 *
 * Con eso, pegar una URL no puede convertirse en markup arbitrario: el id pasa
 * por una expresión regular estricta y cualquier cosa que no encaje se descarta.
 *
 * Todos los proveedores usan iframe directo. No se carga el SDK de Meta ni el
 * script de TikTok: además de traer seguimiento de terceros al blog, obligan a
 * un App ID en el caso de Facebook.
 */

// Un id válido nunca lleva comillas, < ni >. Esta es la última línea de defensa
// antes de interpolar en HTML.
const SAFE_ID = /^[A-Za-z0-9_-]+$/;

export const EMBED_PROVIDERS = {
  youtube: {
    label: "YouTube",
    // 11 caracteres, el formato de id de YouTube.
    match: [
      /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ],
    // nocookie: no deja cookies de seguimiento hasta que se pulsa play.
    src: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
    ratio: "16 / 9",
    allow: "accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share",
  },

  tiktok: {
    label: "TikTok",
    match: [/tiktok\.com\/.*\/video\/(\d+)/, /tiktok\.com\/v\/(\d+)/],
    src: (id) => `https://www.tiktok.com/embed/v2/${id}`,
    ratio: "9 / 16",
    allow: "encrypted-media; picture-in-picture",
    maxWidth: "325px",
  },

  instagram: {
    label: "Instagram",
    // Posts y reels comparten el mismo shortcode y el mismo embed.
    match: [/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/],
    src: (id) => `https://www.instagram.com/p/${id}/embed/`,
    ratio: "4 / 5",
    allow: "encrypted-media; picture-in-picture",
    maxWidth: "400px",
  },

  facebook: {
    label: "Facebook",
    // Aquí el "id" es la URL completa del vídeo, así que se guarda codificada y
    // se valida aparte: SAFE_ID no aplica.
    match: [/^(https?:\/\/(?:www\.)?facebook\.com\/[^\s"'<>]+)$/],
    src: (id) => `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(id)}&show_text=false`,
    ratio: "16 / 9",
    allow: "encrypted-media; picture-in-picture; web-share",
    rawUrlId: true,
  },
};

/**
 * Reconoce una URL y devuelve { provider, id }, o null si no la cubre ningún
 * proveedor de la lista.
 */
export function parseEmbedUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  for (const [provider, config] of Object.entries(EMBED_PROVIDERS)) {
    for (const pattern of config.match) {
      const found = trimmed.match(pattern);
      if (found) return { provider, id: found[1] };
    }
  }
  return null;
}

/** true si el par (provider, id) es seguro de interpolar. */
export function isValidEmbed(provider, id) {
  const config = EMBED_PROVIDERS[provider];
  if (!config || !id) return false;

  if (config.rawUrlId) {
    // Solo URLs http(s) del propio dominio del proveedor, sin comillas.
    return /^https?:\/\/(?:www\.)?facebook\.com\/[^\s"'<>]+$/.test(id);
  }
  return SAFE_ID.test(id);
}

/** Devuelve el src del iframe, o null si el par no es válido. */
export function embedSrc(provider, id) {
  if (!isValidEmbed(provider, id)) return null;
  return EMBED_PROVIDERS[provider].src(id);
}
