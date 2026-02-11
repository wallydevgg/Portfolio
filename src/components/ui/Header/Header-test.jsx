import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../Icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { Switch, Menu, MenuButton } from "../../../barrell";
import "./Header.scss";

const Header = () => {
  // Estado para el scroll
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  // Función para el scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const visible = prevScrollPos > currentScrollPos;
      setPrevScrollPos(currentScrollPos);
      setVisible(visible);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);
  // Estado para abrir el menú
  const [isOpen, setIsOpen] = useState(false);
  const openMenu = () => {
    setIsOpen(true);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <header className="header-container">
      <nav className="nav-container" style={{ top: visible ? "0" : "-100px" }}>
        <Link to="/" className="link-to">
          <div className="logo-container">
            <span className="logo-icon">
              <Icon className="" css="icon" icon={faCode} />
            </span>
            <span className="logo-text">wallydev</span>
          </div>
        </Link>
        <div className="nav-right">
          <Menu handleLinkClick={handleLinkClick} />
          <MenuButton
            isOpen={isOpen}
            openMenu={openMenu}
            closeMenu={closeMenu}
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
