/**
 * Site key de Cloudflare Turnstile.
 *
 * Va escrita aquí, y no solo en un secret de GitHub, porque **no es secreta**:
 * viaja dentro del bundle que descarga cualquiera. Cloudflare la valida contra
 * la lista de dominios del widget, así que copiarla no sirve de nada fuera de
 * wallydev.dev.
 *
 * El motivo de moverla es concreto. El JSX era
 * `{import.meta.env.VITE_TURNSTILE_SITE_KEY && (<widget/>)}`, y Vite sustituye
 * esa variable en tiempo de build: con el secret de GitHub vacío, el bloque
 * entero desaparecía del bundle como código muerto. El captcha llevaba días sin
 * existir en producción y nada lo delataba, porque el formulario seguía
 * aceptando envíos. Con la clave en el código, un secret mal puesto ya no puede
 * apagar el widget en silencio.
 *
 * La variable de entorno sigue teniendo prioridad, que es lo que permite usar en
 * local las claves de prueba que publica Cloudflare:
 *
 *   siempre pasa:   1x00000000000000000000AA
 *   siempre falla:  2x00000000000000000000AB
 */
const PRODUCTION_SITE_KEY = "0x4AAAAAAEVo0pcRq_E6jQ8E";

export const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || PRODUCTION_SITE_KEY;

export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Carga el script del widget una sola vez.
 *
 * Devuelve una promesa para que quien lo use pueda esperar a que `window
 * .turnstile` exista; antes se añadía el <script> y se seguía adelante, así que
 * un envío rápido podía salir sin token.
 */
let loader = null;

export function loadTurnstile() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loader) return loader;

  loader = new Promise((resolve) => {
    const existing = document.querySelector(`script[src^="${TURNSTILE_SCRIPT_URL}"]`);
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve(window.turnstile ?? null));
    // Si el script no carga —bloqueador, red caída— se resuelve a null en vez
    // de quedarse colgado: el envío seguirá sin token y lo rechazará el
    // servidor, que es quien debe decidir.
    script.addEventListener("error", () => resolve(null));

    if (!existing) {
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return loader;
}

/** Solo para tests: olvida el script ya cargado. */
export function resetTurnstileLoader() {
  loader = null;
}
