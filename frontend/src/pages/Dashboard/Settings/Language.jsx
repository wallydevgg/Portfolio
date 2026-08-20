import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Languages } from "lucide-react";
import { dynamicActivate, locales } from "@/i18n";
import AppearanceOption from "./AppearanceOption";
import "./Appearance.scss";

// Bandera por idioma. Va aquí y no en i18n.js porque es decisión de esta
// pantalla: el resto del proyecto solo necesita el código y el nombre.
const FLAGS = {
  en: "🇬🇧",
  es: "🇪🇸",
};

function Flag({ code }) {
  return <span aria-hidden="true">{FLAGS[code] ?? "🌐"}</span>;
}

export default function LanguageSettingsPage() {
  const { i18n } = useLingui();

  const options = Object.entries(locales).map(([code, name]) => ({
    value: code,
    icon: () => <Flag code={code} />,
    label: name,
    hint: code === "en" ? t`Default language.` : t`Full translation.`,
  }));

  return (
    <div className="appearance-settings">
      <div className="appearance-settings__header">
        <div className="appearance-settings__header-text">
          <Languages className="appearance-settings__header-icon" />
          <div>
            <h1>{t`Language`}</h1>
            <p>{t`Changes the interface language of the dashboard and the public site. The choice is saved on this device.`}</p>
          </div>
        </div>
      </div>

      <div className="appearance-settings__card">
        <div
          className="appearance-settings__options"
          role="radiogroup"
          aria-label={t`Language`}
        >
          {options.map((option) => (
            <AppearanceOption
              key={option.value}
              name="language"
              checked={i18n.locale === option.value}
              onChange={dynamicActivate}
              {...option}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
