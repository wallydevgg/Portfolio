import { Link } from "react-router";
import { Switch } from "@/barrell";
import { useLingui } from "@lingui/react";
import LangSwitch from "../../Buttons/Switch/LangSwitch";
import { NAV_ITEMS, menuToggleLabel, navLabel } from "../navItems";
import "./MenuButton.scss";

/**
 * Menú desplegable de móvil y tablet.
 *
 * Comparte la lista con el menú de escritorio (NAV_ITEMS). Antes tenía su
 * propia copia con tres entradas en inglés fijo, sin #contact, sin #blog y sin
 * el selector de idioma.
 *
 * El estado de apertura viene de Header, que ya lo pasaba por props: este
 * componente lo ignoraba y llevaba un `useState` propio, así que había dos
 * fuentes de verdad para lo mismo. También usa el `handleLinkClick` de Header,
 * que descuenta la altura de la barra fija al hacer scroll — la versión de
 * aquí saltaba a la sección y dejaba el título tapado.
 */
const MenuButton = ({ openMenu, closeMenu, isOpen, handleLinkClick }) => {
  useLingui();

  const toggleMenu = () => (isOpen ? closeMenu() : openMenu());

  return (
    <>
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={closeMenu} />
      <div className={`menu ${isOpen ? "open" : ""}`}>
        <ul>
          <li className="menu__controls">
            <Switch />
            <LangSwitch />
          </li>
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <Link to={item.to} onClick={() => handleLinkClick(item.section)}>
                <span className="hashTag">#</span>
                {navLabel(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="menu-toggle"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label={menuToggleLabel()}
      >
        <span className={`menu-toggle__icon ${isOpen ? "open" : ""}`} />
      </button>
    </>
  );
};

export default MenuButton;
