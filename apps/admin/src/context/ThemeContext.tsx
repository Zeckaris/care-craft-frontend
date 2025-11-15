import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeState {
  palette: string;
  setPalette: (id: string) => void;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const PALETTES = [
  { id: "1", name: "Forest Sage", color: "#4f8a6b" },
  { id: "2", name: "Mint Breeze", color: "#10b981" },
  { id: "3", name: "Warm Coral", color: "#f43f5e" },
  { id: "4", name: "Ocean Teal", color: "#0891b2" },
  { id: "5", name: "Sunset Purple", color: "#8b5cf6" },
  { id: "6", name: "Dark Mode", color: "#60a5fa" },
  { id: "7", name: "Vivid Sky", color: "#0ea5e9" },
] as const;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [palette, setPaletteState] = useState<string>("5");

  const setPalette = (id: string) => {
    document.documentElement.className = `palette-${id}`;
    localStorage.setItem("user-palette", id);
    setPaletteState(id);
  };

  useEffect(() => {
    const saved = localStorage.getItem("user-palette") || "5";
    setPalette(saved);
  }, []);

  return (
    <ThemeContext.Provider value={{ palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
