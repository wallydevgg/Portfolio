import React from "react";
import ReactDOM from "react-dom/client";
import Router from "@/router/Router";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@lingui/react"; // Import I18nProvider from @lingui/react
import i18n from "./i18n"; // Import i18n from your LinguiJS setup
import "./tailwind.css";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      {" "}
      {/* Use I18nProvider */}
      <HelmetProvider>
        <Router />
      </HelmetProvider>
    </I18nProvider>
  </React.StrictMode>,
);
