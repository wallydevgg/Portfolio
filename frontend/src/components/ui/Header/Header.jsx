import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../Icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton } from "@/barrell";
import "./Header.scss";

const Header = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [manualScroll, setManualScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (manualScroll) return;

      const currentScrollPos = window.pageYOffset;
      const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      setPrevScrollPos(currentScrollPos);
      setVisible(visible);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos, manualScroll]);

  const [isOpen, setIsOpen] = useState(false);
  const openMenu = () => {
    setIsOpen(true);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleLinkClick = (id) => {
    closeMenu();
    setManualScroll(true);
    scrollToSection(id);
    setTimeout(() => {
      setManualScroll(false);
    }, 900);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const topPosition =
        element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({
        top: topPosition,
        behavior: "smooth",
      });
    }
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
