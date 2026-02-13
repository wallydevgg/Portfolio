import React from "react";
import i18n, { dynamicActivate } from "../../../../i18n"; // Adjust the path if necessary
import "./LangSwitch.scss";

const LangSwitch = () => {
  const toggleLanguage = () => {
    const newLocale = i18n.locale === "en" ? "es" : "en";
    dynamicActivate(newLocale);
  };

  return (
    <div className="switch">
      <input
        id="language-toggle"
        className="check-toggle check-toggle-round-flat"
        type="checkbox"
        checked={i18n.locale === "es"}
        onChange={toggleLanguage}
      />
      <label htmlFor="language-toggle">
        <span className={i18n.locale === "en" ? "off" : "on"}>
          {i18n.locale === "en" ? "EN" : "ES"}
        </span>
      </label>
    </div>
  );
};

export default LangSwitch;
