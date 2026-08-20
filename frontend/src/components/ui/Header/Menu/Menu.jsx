import { Link } from "react-router";
import { Switch } from "@/barrell";
import { useLingui } from "@lingui/react";
import LangSwitch from "../../Buttons/Switch/LangSwitch";
import { NAV_ITEMS, navLabel } from "../navItems";
import "./Menu.scss";

const Menu = ({ handleLinkClick }) => {
  useLingui();
  return (
    <nav className="menu-header">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <Link to={item.to} onClick={() => handleLinkClick(item.section)}>
              <span className="hashTag">#</span>
              {navLabel(item.key)}
            </Link>
          </li>
        ))}
        <li>
          <Switch />
        </li>
        <li>
          <LangSwitch />
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
