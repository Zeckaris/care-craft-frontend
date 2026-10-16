/**
 * Resolves a school logo URL against the configured assets base.
 *
 * Rules:
 *  - null or undefined -> null
 *  - absolute URLs starting with "http" -> returned as-is
 *  - relative paths (e.g. /uploads/...) -> prepended with assetsBase
 */
export function resolveLogoUrl(
  logo?: string | null,
  assetsBase: string = '',
): string | null {
  if (!logo) return null;
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo;
  }
  const cleanBase = assetsBase.endsWith('/') ? assetsBase.slice(0, -1) : assetsBase;
  const cleanPath = logo.startsWith('/') ? logo : `/${logo}`;
  return `${cleanBase}${cleanPath}`;
}
