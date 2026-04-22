import { useContext } from "react";
import { Icon } from "../../../Icons";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../../Context/ThemeContext";

const Switch = () => {
  const { theme, toggleTheme, followSystemTheme } = useContext(ThemeContext);

  return (
    <>
      <button
        className="h-8 w-8 bg-transparent border-none text-[var(--color-primary)] text-[1.4rem] cursor-pointer transition-transform duration-300 hover:scale-105"
        aria-label="Cambiar tema"
        onClick={toggleTheme}
      >
        {theme === "light" ? (
          <Icon className="dark" css="icon" icon={faMoon} />
        ) : (
          <Icon className="light" css="icon" icon={faSun} />
        )}
      </button>
      {/*       <button className="toggle-system-theme" onClick={followSystemTheme}>
        <Icon className="system" css="icon" icon={faLaptopCode} />

      </button> */}
    </>
  );
};

export default Switch;
