import React, { useState, useEffect } from "react";
import { Header, Footer } from "../../../barrell";
import { ThemeContext } from "../../../barrell";
import { Outlet } from "react-router-dom";
import { GoogleFontsOptimizer } from "../../Context/FontsOptimizer";

const Layout = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${theme}-theme min-h-screen`}>
        <GoogleFontsOptimizer />
        <Header />
        <Outlet />
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
};

export default Layout;
