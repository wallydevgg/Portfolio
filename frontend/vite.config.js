import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";
import path from "path";
import dynamicImport from "vite-plugin-dynamic-import";
import sass from "sass";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["macros"],
      },
    }),
    lingui(),
    dynamicImport(),
  ],
  server: {
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@images": path.resolve(__dirname, "./images"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        silenceDeprecations: ["legacy-js-api", "import"],
      },
    },
  },
});
