import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../Icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton } from "@/barrell";

const Header = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [manualScroll, setManualScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (manualScroll) return;
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, manualScroll]);

  const [isOpen, setIsOpen] = useState(false);
  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  const handleLinkClick = (id) => {
    closeMenu();
    setManualScroll(true);
    scrollToSection(id);
    setTimeout(() => setManualScroll(false), 900);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const topPosition = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topPosition, behavior: "smooth" });
    }
  };

  return (
    <header className="flex justify-center">
      <nav
        className="flex flex-row items-center justify-between px-8 py-1 fixed w-[80%] max-[599px]:w-[95%] transition-[top] duration-300 ease-in-out rounded-[1.25rem] mt-[2px] z-[1000] bg-[var(--BgLight)] dark:bg-[var(--BgDark)] border-b-2 border-[var(--color-primary)] dark:border-transparent"
        style={{ top: visible ? "0" : "-100px" }}
      >
        <Link to="/" className="no-underline">
          <div className="flex flex-row items-center py-3 px-1 gap-3">
            <span className="text-[var(--color-primary)] text-2xl">
              <Icon css="icon" icon={faCode} />
            </span>
            <span className="text-2xl font-semibold text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
              wallydev
            </span>
          </div>
        </Link>
        <div className="flex gap-6 items-center">
          <Menu handleLinkClick={handleLinkClick} />
          <MenuButton isOpen={isOpen} openMenu={openMenu} closeMenu={closeMenu} />
        </div>
      </nav>
    </header>
  );
};

export default Header;
