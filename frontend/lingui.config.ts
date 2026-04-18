import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["en", "es"],
  catalogs: [
    {
      path: "src/locales/{locale}/messages.po",
      include: ["src/components", "src/pages"],
    },
  ],
  compileNamespace: "ts",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en"
  }
};

export default config;
