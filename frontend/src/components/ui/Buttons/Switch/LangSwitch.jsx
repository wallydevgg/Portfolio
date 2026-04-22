import React from "react";
import i18n, { dynamicActivate } from "../../../../i18n";

const LangSwitch = () => {
  const isEs = i18n.locale === "es";

  const toggleLanguage = () => {
    dynamicActivate(isEs ? "en" : "es");
  };

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="relative inline-flex items-center w-20 h-8 rounded-full bg-[#f36f25] cursor-pointer border-none transition-colors duration-200 shrink-0"
    >
      {/* sliding circle */}
      <span
        className={`absolute top-[0.2rem] h-[1.6rem] w-10 bg-white rounded-full transition-[margin] duration-200 ease-in-out ${
          isEs ? "ml-[calc(5rem-2.7rem)]" : "ml-[0.2rem]"
        }`}
      />
      {/* text label */}
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#f36f25] z-10 pointer-events-none">
        {isEs ? "ES" : "EN"}
      </span>
    </button>
  );
};

export default LangSwitch;
