import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["en", "es"],
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src/"],
    },
  ],
  compileNamespace: "ts",
  fallbackLocales: {
    default: "en"
  }
};

export default config;
