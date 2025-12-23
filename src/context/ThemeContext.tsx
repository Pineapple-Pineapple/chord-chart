"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemeContextType } from "@/types";

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "Monokai",
  setTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
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
