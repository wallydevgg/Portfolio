/**
 * Portada por defecto para los posts sin `cover_image`.
 *
 * Es un SVG en data-URI y no un archivo: así no depende de MinIO ni añade una
 * petición, y un post sin portada nunca deja el hueco en blanco que descuadra
 * las cards del listado.
 *
 * El patrón repite el ángulo del circuito del fondo con el ámbar de la marca,
 * para que se lea como parte del sitio y no como una imagen rota.
 */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#16151f"/>
      <stop offset="100%" stop-color="#0f0e17"/>
    </linearGradient>
    <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M0 20h12l8-8h20M20 40V28l8-8" fill="none" stroke="#ff8906" stroke-opacity="0.18" stroke-width="1.5"/>
      <circle cx="12" cy="20" r="2" fill="#ff8906" fill-opacity="0.3"/>
      <circle cx="28" cy="12" r="2" fill="#ff8906" fill-opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="800" height="400" fill="url(#g)"/>
  <rect width="800" height="400" fill="url(#p)"/>
  <text x="400" y="212" font-family="'Fira Code', monospace" font-size="30" fill="#ff8906" fill-opacity="0.75" text-anchor="middle">&lt;/&gt; wallydev</text>
</svg>`;

export const POST_COVER_FALLBACK = `data:image/svg+xml,${encodeURIComponent(FALLBACK_SVG)}`;
