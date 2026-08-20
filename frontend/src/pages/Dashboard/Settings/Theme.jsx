import { useContext } from "react";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { ThemeContext } from "@/barrell";
import AppearanceOption from "./AppearanceOption";
import "./Appearance.scss";

export default function ThemeSettingsPage() {
  // useLingui() sin desestructurar: suscribe el componente al cambio de idioma
  // para que las cadenas de `t` se vuelvan a evaluar. Es el patrón que ya usa
  // el resto del proyecto.
  useLingui();
  const { preference, setThemePreference } = useContext(ThemeContext);

  const options = [
    {
      value: "light",
      icon: Sun,
      label: t`Light`,
      hint: t`Always use the light theme.`,
    },
    {
      value: "dark",
      icon: Moon,
      label: t`Dark`,
      hint: t`Always use the dark theme.`,
    },
    {
      value: "system",
      icon: Monitor,
      label: t`System`,
      hint: t`Follow your operating system setting.`,
    },
  ];

  return (
    <div className="appearance-settings">
      <div className="appearance-settings__header">
        <div className="appearance-settings__header-text">
          <Palette className="appearance-settings__header-icon" />
          <div>
            <h1>{t`Theme`}</h1>
            <p>{t`Applies to the dashboard and to the public site. The choice is saved on this device.`}</p>
          </div>
        </div>
      </div>

      <div className="appearance-settings__card">
        <div
          className="appearance-settings__options"
          role="radiogroup"
          aria-label={t`Theme`}
        >
          {options.map((option) => (
            <AppearanceOption
              key={option.value}
              name="theme"
              checked={preference === option.value}
              onChange={setThemePreference}
              {...option}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
