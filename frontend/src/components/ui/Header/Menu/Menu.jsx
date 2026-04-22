import { Link } from "react-router-dom";
import { Switch } from "@/barrell";
import LangSwitch from "../../Buttons/Switch/LangSwitch";
import { t } from "@lingui/macro";

const li = "flex justify-center";

const Menu = ({ handleLinkClick }) => {
  return (
    <nav className="hidden lg:block">
      <ul className="flex flex-row gap-6 items-center list-none">
        <li className={li}>
          <Link to="/" onClick={() => handleLinkClick("hero")} className="nav-link">
            <span className="hashTag">#</span>{t`menu.home`}
          </Link>
        </li>
        <li className={li}>
          <Link to="/" onClick={() => handleLinkClick("experience")} className="nav-link">
            <span className="hashTag">#</span>{t`menu.experience`}
          </Link>
        </li>
        <li className={li}>
          <Link to="/" onClick={() => handleLinkClick("projects")} className="nav-link">
            <span className="hashTag">#</span>{t`menu.projects`}
          </Link>
        </li>
        <li className={li}>
          <Link to="/blog" onClick={() => handleLinkClick("")} className="nav-link">
            <span className="hashTag">#</span>{t`menu.blog`}
          </Link>
        </li>
        <li className={li}>
          <Link to="/" onClick={() => handleLinkClick("about")} className="nav-link">
            <span className="hashTag">#</span>{t`menu.about`}
          </Link>
        </li>
        <li className={li}>
          <Link to="/" onClick={() => handleLinkClick("contact")} className="nav-link">
            <span className="hashTag">#</span>{t`menu.contact`}
          </Link>
        </li>
        <li className={li}><Switch /></li>
        <li className={li}><LangSwitch /></li>
      </ul>
    </nav>
  );
};

export default Menu;
