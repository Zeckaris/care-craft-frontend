import React, { createContext, useContext, useState, useEffect } from "react";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";

interface ThemeState {
  palette: string;
  setPalette: (id: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
}

// Palette definitions
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

// Font links mapping (Google Fonts)
const FONT_LINKS: Record<string, string> = {
  Roboto:
    "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
  "Open Sans":
    "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap",
  Ubuntu:
    "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
  Lato: "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap",
  Montserrat:
    "https://fonts.googleapis.com/css2?family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  Inter:
    "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  Nunito:
    "https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap",
  "Source Sans Pro":
    "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap",
  "Mountains of Christmas":
    "https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&display=swap",
};

export const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [palette, setPaletteState] = useState<string | null>(null); // null = not ready
  const [fontFamily, setFontFamilyState] = useState<string>("Roboto"); // default
  const { schoolInfo, isLoading: schoolLoading } = useSchoolInfo();

  // Palette logic (unchanged)
  const setPalette = (id: string) => {
    const normalizedId = id.startsWith("palette-") ? id : `palette-${id}`;
    document.documentElement.className = normalizedId;
    localStorage.setItem("user-palette", id);
    setPaletteState(id);
  };

  useEffect(() => {
    if (schoolLoading) return;

    if (schoolInfo?.theme) {
      setPalette(schoolInfo.theme);
    } else {
      const saved = localStorage.getItem("user-palette");
      setPalette(saved || "palette-1");
    }

    if (schoolInfo?.fontFamily) {
      setFontFamilyState(schoolInfo.fontFamily);
    } else {
      const savedFont = localStorage.getItem("user-font");
      setFontFamilyState(savedFont || "Roboto");
    }
  }, [schoolInfo, schoolLoading]);

  // Font effect: load Google Fonts and update CSS variable
  useEffect(() => {
    if (!fontFamily) return;

    // Inject Google Font
    if (!document.getElementById(`font-${fontFamily}`)) {
      const link = document.createElement("link");
      link.id = `font-${fontFamily}`;
      link.rel = "stylesheet";
      link.href = FONT_LINKS[fontFamily] || FONT_LINKS["Roboto"];
      link.onload = () => {
        // Update CSS variable after font is loaded
        document.documentElement.style.setProperty(
          "--font-family-base",
          fontFamily
        );
      };
      document.head.appendChild(link);
    } else {
      // Font already exists — just update CSS variable
      document.documentElement.style.setProperty(
        "--font-family-base",
        fontFamily
      );
    }

    localStorage.setItem("user-font", fontFamily);
  }, [fontFamily]);

  const setFontFamily = (font: string) => {
    setFontFamilyState(font);
  };

  if (palette === null || schoolLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ palette, setPalette, fontFamily, setFontFamily }}
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
