import React from "react";
import { useLingui } from "@lingui/react";
import { dynamicActivate } from "../../../../i18n";
import "./LangSwitch.scss";

const LangSwitch = () => {
  const { i18n } = useLingui();
  const isES = i18n.locale === "es";

  const toggleLanguage = () => {
    dynamicActivate(isES ? "en" : "es");
  };

  return (
    <div className="switch">
      <input
        id="language-toggle"
        className="check-toggle check-toggle-round-flat"
        type="checkbox"
        checked={isES}
        onChange={toggleLanguage}
      />
      <label htmlFor="language-toggle">
        <span className={isES ? "on" : "off"}>
          {isES ? "ES" : "EN"}
        </span>
      </label>
    </div>
  );
};

export default LangSwitch;
