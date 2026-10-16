export type { BrandingInfo } from '@carecraft/types';

export interface PaletteMetadata {
  id: string;
  name: string;
  color: string;
}

export interface PaletteDefinition {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  bg: string;
  text: string;
  sidebar: string;
  header: string;
  border: string;
  cardBg: string;
  cardBgHover: string;
  inputBg: string;
}

export interface PalettePreviewColors {
  headerBg: string;
  sidebarBg: string;
  contentBg: string;
  success: string;
  danger: string;
}

export interface FontOption {
  value: string;
  label: string;
}

export interface ApplyBrandingOptions {
  theme?: string | null;
  fontFamily?: string | null;
  updateMetaThemeColor?: boolean;
  /**
   * When true, also derive the app's neutral surface/text/border/sidebar/header
   * tokens (the `--color-*` set) from the palette. Opt-in so consumers that
   * manage those tokens themselves (e.g. the admin's `--palette-*` CSS) are
   * left untouched.
   */
  semanticTokens?: boolean;
}
