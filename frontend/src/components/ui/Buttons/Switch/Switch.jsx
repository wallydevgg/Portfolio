import { useContext } from "react";
import { Icon } from "../../../Icons";
import {
  faMoon,
  faSun,
  faAdjust,
  faComputer,
  faLaptop,
  faLaptopCode,
  faHouseLaptop,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../../Context/ThemeContext";
import "./Switch.scss";

const Switch = () => {
  const { theme, toggleTheme, followSystemTheme } = useContext(ThemeContext);

  return (
    <>
      <button
        className="toggle-theme"
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
