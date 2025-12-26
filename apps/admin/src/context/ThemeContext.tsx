import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeState {
  palette: string;
  setPalette: (id: string) => void;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const PALETTES = [
  { id: "palette-1", name: "Forest Sage", color: "#4f8a6b" },
  { id: "palette-2", name: "Mint Breeze", color: "#10b981" },
  { id: "palette-3", name: "Warm Coral", color: "#f43f5e" },
  { id: "palette-4", name: "Ocean Teal", color: "#0891b2" },
  { id: "palette-5", name: "Sunset Purple", color: "#8b5cf6" },
  { id: "palette-6", name: "Vivid Sky", color: "#0ea5e9" },
  { id: "palette-7", name: "Classic Navy & Gold", color: "#0c2340" },
  { id: "palette-8", name: "Maroon & Cream", color: "#861f2d" },
  { id: "palette-9", name: "Forest Green & Beige", color: "#264e36" },
  { id: "palette-10", name: "Royal Purple & Silver", color: "#581c87" },
  { id: "palette-11", name: "Crimson & Gray", color: "#9b2c2c" },
  { id: "palette-12", name: "Indigo & Light Blue", color: "#3730a3" },
] as const;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [palette, setPaletteState] = useState<string>("5");

  const setPalette = (id: string) => {
    // Normalize: if id already has "palette-", use as-is; otherwise add it
    const className = id.startsWith("palette-") ? id : `palette-${id}`;
    document.documentElement.className = className;
    localStorage.setItem("user-palette", id); // keep original id for storage
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
