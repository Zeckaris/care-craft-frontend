import React, { createContext, useContext, useState, useEffect } from "react";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";
import { useUser } from "@/context/UserContext";
import {
  PALETTES,
  FONT_LINKS,
  DEFAULT_THEME,
  DEFAULT_FONT,
  applyBranding,
} from "@carecraft/branding";

export { PALETTES, FONT_LINKS };

interface ThemeState {
  palette: string;
  setPalette: (id: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
}

export const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [palette, setPaletteState] = useState<string | null>(null);
  const [fontFamily, setFontFamilyState] = useState<string>("Roboto");

  const { user } = useUser();
  const isAuthenticated = !!user;

  // Call the hook unconditionally (enabled param is optional, defaults to true)
  const schoolInfoResult = useSchoolInfo(isAuthenticated);

  // Use the pre-processed fields from your hook
  const schoolInfo = schoolInfoResult.schoolInfo;
  const schoolLoading = schoolInfoResult.isLoading;

  const setPalette = (id: string) => {
    applyBranding({ theme: id });
    localStorage.setItem("user-palette", id);
    setPaletteState(id);
  };

  useEffect(() => {
    if (schoolLoading) return;

    const dbTheme = schoolInfo?.theme;
    if (dbTheme) {
      setPalette(dbTheme);
    } else {
      const saved = localStorage.getItem("user-palette") || DEFAULT_THEME;
      setPalette(saved);
    }

    const dbFont = schoolInfo?.fontFamily;
    if (dbFont) {
      setFontFamilyState(dbFont);
    } else {
      const savedFont = localStorage.getItem("user-font");
      setFontFamilyState(savedFont || DEFAULT_FONT);
    }
  }, [
    schoolInfo?.theme,
    schoolInfo?.fontFamily,
    schoolLoading,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (!fontFamily) return;
    applyBranding({ fontFamily });
    localStorage.setItem("user-font", fontFamily);
  }, [fontFamily]);

  const setFontFamily = (font: string) => {
    setFontFamilyState(font);
  };

  if (palette === null || (isAuthenticated && schoolLoading)) {
    return <div>Loading theme...</div>;
  }

  return (
    <ThemeContext.Provider
      value={{
        palette: palette || "palette-1",
        setPalette,
        fontFamily,
        setFontFamily,
      }}
    >
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
