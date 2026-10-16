import type { PaletteDefinition } from './types';

/**
 * Semantic design tokens for apps that build their UI on the shared
 * `--color-*` custom properties (currently the Teacher app).
 *
 * `buildSemanticTokens` is the single seam that maps a school palette onto
 * those tokens. The shipped palettes are light-only; when proper dark palettes
 * land, the dark mapping is added here (one place) and the mode argument below
 * is extended — no dark code path exists yet, so there is no dead code.
 */
export type SemanticTokens = Record<string, string>;

function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return null;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return [r, g, b];
}

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0');
}

/**
 * Blends `base` toward `mix`. A `baseWeight` of 1 returns `base`, 0 returns
 * `mix`. Used to derive secondary/muted text from a palette's text and surface
 * colours instead of hardcoded greys.
 */
export function mixHex(base: string, mix: string, baseWeight: number): string {
  const a = parseHex(base);
  const b = parseHex(mix);
  if (!a || !b) return base;
  const w = Math.max(0, Math.min(1, baseWeight));
  return `#${toHex(a[0] * w + b[0] * (1 - w))}${toHex(a[1] * w + b[1] * (1 - w))}${toHex(a[2] * w + b[2] * (1 - w))}`;
}

/**
 * Maps a palette to the semantic `--color-*` tokens used by the Teacher app.
 *
 * Surfaces and text come straight from the palette values the admin already
 * relies on, so both apps share the same tested colour relationships.
 * Secondary and muted text are mixed from the palette text toward the surface.
 * Sidebar/header backgrounds use the palette's sidebar/header colours paired
 * with light text, mirroring how the admin styles them.
 */
export function buildSemanticTokens(palette: PaletteDefinition): SemanticTokens {
  const surface = palette.cardBg;

  return {
    // Surfaces
    '--color-bg': palette.bg,
    '--color-surface': palette.cardBg,
    '--color-surface-raised': palette.cardBgHover,
    '--color-border': palette.border,

    // Text (secondary/muted derived from the palette text + surface)
    '--color-text': palette.text,
    '--color-text-secondary': mixHex(palette.text, surface, 0.78),
    '--color-text-muted': mixHex(palette.text, surface, 0.45),

    // Desktop sidebar — palette sidebar bg with light text (as admin)
    '--color-sidebar': palette.sidebar,
    '--color-sidebar-fg': '#ffffff',
    '--color-sidebar-muted': 'rgba(255, 255, 255, 0.72)',
    '--color-sidebar-hover': 'rgba(255, 255, 255, 0.15)',
    '--color-sidebar-active': 'rgba(255, 255, 255, 0.25)',
    '--color-sidebar-border': 'rgba(255, 255, 255, 0.12)',

    // Top header — palette header bg with light text (as admin)
    '--color-header': palette.header,
    '--color-header-fg': '#ffffff',
    '--color-header-muted': 'rgba(255, 255, 255, 0.78)',
    '--color-header-border': 'rgba(255, 255, 255, 0.12)',
  };
}
