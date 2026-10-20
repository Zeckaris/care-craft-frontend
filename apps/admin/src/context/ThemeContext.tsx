import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ConfigProvider } from "antd";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";
import { useUser } from "@/context/UserContext";
import {
  PALETTES,
  FONT_LINKS,
  FONT_FALLBACK,
  DEFAULT_THEME,
  DEFAULT_FONT,
  applyBranding,
  getCachedBranding,
  setCachedBranding,
} from "@carecraft/branding";

export { PALETTES, FONT_LINKS };

export interface BrandingSelection {
  theme?: string;
  fontFamily?: string;
}

interface ThemeState {
  palette: string;
  setPalette: (id: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  previewBranding: (selection: BrandingSelection) => void;
  commitBranding: (selection: BrandingSelection) => void;
}

export const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cachedBrandingRef = useRef(getCachedBranding());

  const [palette, setPaletteState] = useState<string>(
    cachedBrandingRef.current?.theme || DEFAULT_THEME,
  );
  const [fontFamily, setFontFamilyState] = useState<string>(
    cachedBrandingRef.current?.fontFamily || DEFAULT_FONT,
  );
  const [ready, setReady] = useState(false);

  const paletteRef = useRef(palette);
  const fontRef = useRef(fontFamily);

  const { user } = useUser();
  const isAuthenticated = !!user;

  // Call the hook unconditionally (enabled param is optional, defaults to true)
  const schoolInfoResult = useSchoolInfo(isAuthenticated);

  // Use the pre-processed fields from your hook
  const schoolInfo = schoolInfoResult.schoolInfo;
  const schoolLoading = schoolInfoResult.isLoading;

  const applySelection = useCallback(
    (selection: BrandingSelection, persist: boolean) => {
      const theme = selection.theme ?? paletteRef.current;
      const font = selection.fontFamily ?? fontRef.current;

      paletteRef.current = theme;
      fontRef.current = font;

      setPaletteState(theme);
      setFontFamilyState(font);
      applyBranding({ theme, fontFamily: font });

      if (!persist) return;

      localStorage.setItem("user-palette", theme);
      localStorage.setItem("user-font", font);
      setCachedBranding({
        ...(getCachedBranding() ?? {}),
        theme,
        fontFamily: font,
      });
    },
    [],
  );

  useEffect(() => {
    if (isAuthenticated && schoolLoading) return;

    const storedTheme = localStorage.getItem("user-palette");
    const storedFont = localStorage.getItem("user-font");
    const theme = schoolInfo?.theme || storedTheme || DEFAULT_THEME;
    const font = schoolInfo?.fontFamily || storedFont || DEFAULT_FONT;

    applySelection({ theme, fontFamily: font }, true);
    setReady(true);
  }, [
    schoolInfo?.theme,
    schoolInfo?.fontFamily,
    schoolLoading,
    isAuthenticated,
    applySelection,
  ]);

  // Preview only while the admin is editing; persisting happens on save.
  const previewBranding = useCallback(
    (selection: BrandingSelection) => applySelection(selection, false),
    [applySelection],
  );

  const commitBranding = useCallback(
    (selection: BrandingSelection) => applySelection(selection, true),
    [applySelection],
  );

  const setPalette = (id: string) => commitBranding({ theme: id });
  const setFontFamily = (font: string) => commitBranding({ fontFamily: font });

  if (isAuthenticated && (!ready || schoolLoading)) {
    return <div>Loading theme...</div>;
  }

  const antdFontFamily = `"${fontFamily}", ${FONT_FALLBACK}`;

  return (
    <ThemeContext.Provider
      value={{
        palette: palette || DEFAULT_THEME,
        setPalette,
        fontFamily,
        setFontFamily,
        previewBranding,
        commitBranding,
      }}
    >
      <ConfigProvider theme={{ token: { fontFamily: antdFontFamily } }}>
        {children}
      </ConfigProvider>
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
