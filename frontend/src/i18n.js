import { i18n } from "@lingui/core";
import { detect, fromStorage, fromNavigator } from "@lingui/detect-locale";

// Import your compiled messages
// The path might vary depending on your lingui.config.ts setup
// Assuming default output to src/locales/{locale}/messages.js
import { messages as enMessages } from "./locales/en/messages.ts";
import { messages as esMessages } from "./locales/es/messages.ts";

export const locales = {
  en: "English",
  es: "Español",
};

const SUPPORTED = Object.keys(locales);

function normalizeLocale(raw) {
  const base = raw?.split("-")[0];
  return SUPPORTED.includes(base) ? base : "en";
}

export const defaultLocale = normalizeLocale(
  detect(fromStorage("locale"), fromNavigator(), "en")
);

export function dynamicActivate(locale) {
  const normalized = normalizeLocale(locale);
  const messages = {
    en: enMessages,
    es: esMessages,
  };
  i18n.loadAndActivate({ locale: normalized, messages: messages[normalized] });

  // La detección de arranque lee `fromStorage("locale")`, pero nadie escribía
  // esa clave: el idioma elegido se perdía en cada recarga y volvía al del
  // navegador. Se guarda aquí, que es el único sitio por el que se cambia.
  try {
    localStorage.setItem("locale", normalized);
  } catch {
    // Modo privado o almacenamiento lleno: el idioma sigue activo en esta
    // sesión, solo no sobrevive a la recarga.
  }
}

// Activate the default locale on load
dynamicActivate(defaultLocale);

export default i18n;