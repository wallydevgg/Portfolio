import React, { useState } from "react";
import { Icon, Switch } from "../../../../barrell";
import { Link } from "react-router-dom";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./MenuButton.scss";

const MenuButton = ({ openMenu, closeMenu, isOpen }) => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!open);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };


  return (
    <>
      <div className={`overlay ${open ? "open" : ""}`} onClick={toggleMenu} />
      <div className={`menu ${open ? "open" : ""}`}>
        <ul>
          <li>
            <Switch />
          </li>
          <li>
            <Link to="/" onClick={() => scrollToSection("experience")}>
              <span className="hashTag">#</span>experience
            </Link>
          </li>
          <li>
            <Link to="/" onClick={() => scrollToSection("projects")}>
              <span className="hashTag">#</span>projects
            </Link>
          </li>
          <li>
            <Link to="/" onClick={() => scrollToSection("about")}>
              <span className="hashTag">#</span>about
            </Link>
          </li>
        </ul>
      </div>
      <button className="menu-toggle" onClick={toggleMenu} aria-label="monstrar menu de navegacion">
        <span className={`menu-toggle__icon ${open ? "open" : ""}`} />
      </button>
    </>
  );
};

export default MenuButton;
