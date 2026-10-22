import type { SchoolFeatures } from '@carecraft/types';
import type { ApplyBrandingOptions } from './types';
import { getPalette, normalizeThemeId, DEFAULT_THEME } from './palettes';
import { FONT_LINKS, FONT_FALLBACK, DEFAULT_FONT } from './fonts';
import { buildSemanticTokens } from './tokens';

export const BRANDING_STORAGE_KEY = 'carecraft_branding_cache';

export interface CachedBranding {
  name?: string;
  logo?: string | null;
  theme?: string;
  fontFamily?: string;
  features?: SchoolFeatures;
}

/**
 * Retrieves synchronously cached branding from localStorage.
 * Used for pre-render theme seeding to avoid any flash of unstyled theme.
 */
export function getCachedBranding(): CachedBranding | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) {
      // Fallback check for admin's legacy keys
      const legacyTheme = window.localStorage.getItem('user-palette');
      const legacyFont = window.localStorage.getItem('user-font');
      if (legacyTheme || legacyFont) {
        return {
          theme: legacyTheme || DEFAULT_THEME,
          fontFamily: legacyFont || DEFAULT_FONT,
        };
      }
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Persists branding to localStorage for instantaneous recovery on next load.
 */
export function setCachedBranding(branding: CachedBranding): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
    if (branding.theme) {
      window.localStorage.setItem('user-palette', branding.theme);
    }
    if (branding.fontFamily) {
      window.localStorage.setItem('user-font', branding.fontFamily);
    }
  } catch {
    // ignore storage write errors
  }
}

/**
 * Helper to convert hex color to rgba string with custom alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Applies palette and typography branding to the document.
 *
 * 1. Sets .palette-X class on <html> for CSS cascade rules.
 * 2. Dynamically drives runtime design token CSS variables on :root.
 * 3. When `semanticTokens` is set, also derives the app's neutral surface,
 *    text, border, sidebar and header tokens from the palette (light-only).
 * 4. Loads font dynamically with system fallbacks and updates typography tokens.
 * 5. Updates the <meta name="theme-color"> tag.
 */
export function applyBranding(
  options: ApplyBrandingOptions,
  targetDoc: Document = typeof document !== 'undefined' ? document : (null as any),
): void {
  if (!targetDoc || !targetDoc.documentElement) return;

  const {
    theme,
    fontFamily,
    updateMetaThemeColor = true,
    semanticTokens = false,
  } = options;
  const root = targetDoc.documentElement;

  // 1. Palette application
  if (theme) {
    const normalizedId = normalizeThemeId(theme);
    const palette = getPalette(normalizedId);

    // Apply palette class on <html> (preserves other classes)
    const existingClasses = (root.className || '')
      .split(/\s+/)
      .filter((c) => Boolean(c) && !c.startsWith('palette-'));
    existingClasses.push(normalizedId);
    root.className = existingClasses.join(' ').trim();

    // Consumers that drive their own semantic tokens are light-palette-only
    // for now, so they must not mix OS dark-mode neutrals with light palettes.
    const isDark =
      !semanticTokens &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    // Set brand color tokens
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-hover', palette.primaryDark);
    root.style.setProperty('--color-primary-fg', '#ffffff');

    // In dark mode, use a translucent tint of primary for light backgrounds to ensure contrast
    const primaryLightColor = isDark
      ? hexToRgba(palette.primary, 0.22)
      : palette.primaryLight;
    root.style.setProperty('--color-primary-light', primaryLightColor);

    // Palette status colors
    root.style.setProperty('--color-success', palette.success);
    root.style.setProperty('--color-success-light', palette.successLight);
    root.style.setProperty('--color-warning', palette.warning);
    root.style.setProperty('--color-warning-light', palette.warningLight);
    root.style.setProperty('--color-danger', palette.danger);
    root.style.setProperty('--color-danger-light', palette.dangerLight);
    root.style.setProperty('--color-info', palette.info);
    root.style.setProperty('--color-info-light', palette.infoLight);

    // Admin / AntD compatibility tokens
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--palette-primary', palette.primary);

    // Neutral surface/text/border/sidebar/header tokens (opt-in consumers only)
    if (semanticTokens) {
      const tokens = buildSemanticTokens(palette);
      for (const [token, value] of Object.entries(tokens)) {
        root.style.setProperty(token, value);
      }
    }

    // Update <meta name="theme-color">
    if (updateMetaThemeColor) {
      let metaTheme = targetDoc.querySelector(
        'meta[name="theme-color"]',
      ) as HTMLMetaElement | null;
      if (!metaTheme) {
        metaTheme = targetDoc.createElement('meta');
        metaTheme.name = 'theme-color';
        targetDoc.head.appendChild(metaTheme);
      }
      metaTheme.content = palette.primary;
    }
  }

  // 2. Font application
  if (fontFamily) {
    const fontUrl = FONT_LINKS[fontFamily] || FONT_LINKS[DEFAULT_FONT];
    const fontId = `carecraft-font-${fontFamily.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    // Set CSS font token immediately with fallback stack for zero latency
    root.style.setProperty(
      '--font-family-base',
      `"${fontFamily}", ${FONT_FALLBACK}`,
    );

    // Inject Google Font link tag if not already injected
    if (!targetDoc.getElementById(fontId) && fontUrl) {
      const link = targetDoc.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.onload = () => {
        root.style.setProperty(
          '--font-family-base',
          `"${fontFamily}", ${FONT_FALLBACK}`,
        );
      };
      targetDoc.head.appendChild(link);
    }
  }
}
