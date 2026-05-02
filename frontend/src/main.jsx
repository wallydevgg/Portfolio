import React from "react";
import ReactDOM from "react-dom/client";
import Router from "@/router/Router";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@lingui/react";
import i18n from "./i18n";
import { ThemeProvider } from "./components/Context/ThemeContext";
import "./tailwind.css";
import "./main.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <ThemeProvider>
        <HelmetProvider>
          <Router />
        </HelmetProvider>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>
);
