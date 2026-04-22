import React, { useState } from "react";
import { Switch } from "../../../../barrell";
import { Link } from "react-router-dom";

const MenuButton = ({ openMenu, closeMenu, isOpen }) => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={toggleMenu}
        className={`fixed inset-0 z-[998] bg-black/50 transition-all duration-300 lg:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 z-[999] w-[80%] max-w-[400px] h-screen transition-transform duration-300 bg-[var(--BgLight)] dark:bg-[var(--BgDark)] border-l border-l-[var(--LM-Title)] dark:border-none lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col justify-center items-center h-full gap-4 text-xl list-none">
          <li><Switch /></li>
          {[
            { id: "experience", label: "experience" },
            { id: "projects",   label: "projects" },
            { id: "about",      label: "about" },
          ].map(({ id, label }) => (
            <li key={id} className="my-2">
              <Link
                to="/"
                onClick={() => { scrollToSection(id); toggleMenu(); }}
                className="nav-link text-[var(--color-primary)] font-bold no-underline"
              >
                <span className="hashTag">#</span>{label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Hamburger button */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)] text-[var(--BgDark)] border-none cursor-pointer transition-all duration-300 lg:hidden z-20"
        onClick={toggleMenu}
        aria-label="mostrar menu de navegacion"
      >
        <span className="relative flex flex-col justify-center items-center w-5 h-5 gap-[4px]">
          <span className={`block w-full h-[2px] bg-[var(--BgDark)] rounded transition-all duration-300 ${open ? "rotate-45 translate-y-[6px]" : ""}`} />
          <span className={`block w-full h-[2px] bg-[var(--BgDark)] rounded transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-full h-[2px] bg-[var(--BgDark)] rounded transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6px]" : ""}`} />
        </span>
      </button>
    </>
  );
};

export default MenuButton;
