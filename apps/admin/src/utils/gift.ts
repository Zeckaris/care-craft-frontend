import { ASSETS_BASE } from '@/services/api-client';

export const GIFT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export function resolveGiftImage(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path;
  return `${ASSETS_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function validateGiftImage(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Choose an image file (PNG, JPG, WebP or GIF).';
  }
  if (file.size > GIFT_IMAGE_MAX_BYTES) {
    return 'Image must be 2 MB or smaller.';
  }
  return null;
}
