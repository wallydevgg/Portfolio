import i18n from "@/i18n";

/**
 * Extract the translation for the current locale from a backend Translation object.
 * Falls back through: current locale -> 'en' -> 'es' -> first available value -> empty string.
 * Also handles legacy plain strings for backward compatibility.
 */
export function getTranslation(value, locale = null) {
  if (!value) return "";
  if (typeof value === "string") return value;
  const loc = locale || i18n.locale || "en";
  return value[loc] || value.en || value.es || Object.values(value)[0] || "";
}
