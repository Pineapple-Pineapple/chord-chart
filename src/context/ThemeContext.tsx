"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  currentTheme: "Ayu Mirage",
  setTheme: (name: string) => { },
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState("Monokai");

  useEffect(() => {
    const saved = localStorage.getItem("app-theme") || "Monokai";
    setThemeName(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const changeTheme = (name: string) => {
    setThemeName(name);
    localStorage.setItem("app-theme", name);
    document.documentElement.setAttribute('data-theme', name);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme: themeName, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
