import { Link } from "react-router-dom";
import { Switch } from "@/barrell";
import "./Menu.scss";
import LangSwitch from "../../Buttons/Switch/LangSwitch";
import { t } from "@lingui/macro";

const Menu = ({ handleLinkClick }) => {
  return (
    <nav className="menu-header">
      <ul>
        <li>
          <Link to="/" onClick={() => handleLinkClick("experience")}>
            <span className="hashTag">#</span>
            {t`menu.experience`}
          </Link>
        </li>
        <li>
          <Link to="/" onClick={() => handleLinkClick("projects")}>
            <span className="hashTag">#</span>
            {t`menu.projects`}
          </Link>
        </li>
        <li>
          <Link to="/" onClick={() => handleLinkClick("about")}>
            <span className="hashTag">#</span>
            {t`menu.about`}
          </Link>
        </li>
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
