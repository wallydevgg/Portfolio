import { i18n } from "@lingui/core";
import { detect, fromStorage, fromNavigator } from "@lingui/detect-locale";

// Import your compiled messages
// The path might vary depending on your lingui.config.ts setup
// Assuming default output to src/locales/{locale}/messages.js
import { messages as enMessages } from "./locales/en/messages.po.ts";
import { messages as esMessages } from "./locales/es/messages.po.ts";

export const locales = {
  en: "English",
  es: "Español",
};

export const defaultLocale = detect(fromStorage("locale"), fromNavigator(), "en");

export function dynamicActivate(locale) {
  const messages = {
    en: enMessages,
    es: esMessages,
  };
  i18n.loadAndActivate({ locale, messages: messages[locale] });
}

// Activate the default locale on load
dynamicActivate(defaultLocale);

export default i18n;