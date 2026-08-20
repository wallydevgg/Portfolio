import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext();

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemTheme() {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * Se guardan dos cosas distintas y conviene no confundirlas:
 *
 * - `preference`: lo que eligió la persona. "light", "dark" o "system".
 * - `theme`: el valor ya resuelto, siempre "light" o "dark".
 *
 * Antes había una sola variable y podía valer "system". Los tres sitios que
 * componen la clase con `${theme}-theme` producían entonces `system-theme`, que
 * no existe en ninguna hoja de estilos: elegir "seguir al sistema" dejaba la
 * interfaz sin tema. Al separar las dos, esos tres consumidores siguen leyendo
 * `theme` y nunca reciben un valor que no puedan usar.
 */
export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" || saved === "system"
      ? saved
      : "system";
  });

  // Se resuelve en el primer render y no en un efecto: si empezara vacío, el
  // primer pintado saldría sin clase de tema y parpadearía.
  const [resolved, setResolved] = useState(() =>
    (localStorage.getItem(STORAGE_KEY) === "light" ||
      localStorage.getItem(STORAGE_KEY) === "dark")
      ? localStorage.getItem(STORAGE_KEY)
      : systemTheme()
  );

  // Solo se escucha al sistema mientras la preferencia sea "system"; con una
  // elección explícita, que el sistema cambie no debe mover nada.
  useEffect(() => {
    if (preference !== "system") {
      setResolved(preference);
      return;
    }

    setResolved(systemTheme());

    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event) => setResolved(event.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  const toggleTheme = useCallback(() => {
    // El botón de dos estados sigue funcionando igual: alterna a partir de lo
    // que se está viendo, aunque la preferencia fuese "system".
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved]);

  const followSystemTheme = useCallback(() => setPreference("system"), []);

  const value = useMemo(
    () => ({
      theme: resolved,
      preference,
      setThemePreference: setPreference,
      toggleTheme,
      followSystemTheme,
    }),
    [resolved, preference, toggleTheme, followSystemTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
