import type { FontOption } from './types';

export const FONT_LINKS: Record<string, string> = {
  Roboto:
    'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
  'Open Sans':
    'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap',
  Ubuntu:
    'https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap',
  Lato:
    'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap',
  Montserrat:
    'https://fonts.googleapis.com/css2?family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
  Inter:
    'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  Nunito:
    'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap',
  'Source Sans Pro':
    'https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap',
  'Mountains of Christmas':
    'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&display=swap',
};

export const FONT_OPTIONS: FontOption[] = [
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Mountains of Christmas', label: 'Mountains of Christmas' },
];

export const DEFAULT_FONT = 'Roboto';

export const FONT_FALLBACK =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function getFontUrl(fontFamily?: string | null): string {
  if (!fontFamily) return FONT_LINKS[DEFAULT_FONT];
  return FONT_LINKS[fontFamily] || FONT_LINKS[DEFAULT_FONT];
}
