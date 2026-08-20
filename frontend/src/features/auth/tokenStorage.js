/**
 * Dónde vive el token del admin.
 *
 * "Remember me" no alarga la sesión: la duración la fija el propio JWT, que el
 * backend emite con `exp = ahora + 7 días` (ACCESS_TOKEN_EXPIRE_MINUTES =
 * 60*24*7 en core/config.py). Lo que decide la casilla es si la sesión
 * sobrevive a cerrar el navegador:
 *
 * - marcada   -> localStorage: dura hasta que caduque el token, 7 días.
 * - sin marcar -> sessionStorage: muere al cerrar la pestaña.
 *
 * Guardar el token en sessionStorage solo funciona si TODO el frontend lo lee
 * por aquí. Antes había doce `localStorage.getItem("admin_token")` sueltos por
 * las páginas del dashboard; con la casilla desmarcada, esos doce se habrían
 * quedado sin token y las llamadas habrían salido sin cabecera.
 */

const TOKEN_KEY = "admin_token";
const REMEMBER_KEY = "admin_remember";

/** Token activo, esté donde esté. */
export function getStoredToken() {
  // sessionStorage primero: si por lo que sea quedaran los dos, el de la
  // pestaña actual es el que acaba de escribir el login.
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

/** Guarda el token en el almacén que corresponda y recuerda la preferencia. */
export function storeToken(token, remember) {
  // Limpiar los dos antes de escribir evita dejar atrás el token de una sesión
  // anterior guardada con la otra opción.
  clearStoredToken();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

/** Borra el token de ambos almacenes. */
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Última preferencia de la casilla. Se guarda en localStorage a propósito, y
 * aparte del token: sirve para que el formulario aparezca como lo dejaste
 * incluso después de una sesión que no se recordó.
 */
export function getRememberPreference() {
  return localStorage.getItem(REMEMBER_KEY) !== "0";
}
