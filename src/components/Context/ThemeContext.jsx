import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && savedTheme !== "system") {
      return savedTheme;
    } else {
      return "system";
    }
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const systemThemeListener = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    const handleSystemThemeChange = (e) => {
      if (theme === "system") {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    systemThemeListener.addEventListener("change", handleSystemThemeChange);

    return () => {
      systemThemeListener.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [theme]);

  useEffect(() => {
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.setAttribute(
        "data-theme",
        systemPrefersDark ? "dark" : "light"
      );
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    }
  };

  const followSystemTheme = () => {
    setTheme("system");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, followSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
