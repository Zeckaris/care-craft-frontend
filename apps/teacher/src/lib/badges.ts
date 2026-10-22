import type { StudentBadgeSource } from '@carecraft/types';
import { ASSETS_BASE } from '@/services/api-client';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'homeroom'
  | 'neutral';

const TIER_LABELS: Record<number, string> = {
  1: 'Level 1 (Bronze)',
  2: 'Level 2 (Silver)',
  3: 'Level 3 (Gold)',
  4: 'Level 4 (Platinum)',
};

export function getBadgeTierLabel(level?: number | null): string {
  if (level === undefined || level === null) return 'Unknown tier';
  return TIER_LABELS[level] ?? `Level ${level}`;
}

const SOURCE_META: Record<
  StudentBadgeSource,
  { label: string; variant: BadgeVariant }
> = {
  teacher: { label: 'Teacher', variant: 'info' },
  admin: { label: 'Admin', variant: 'primary' },
  system: { label: 'System', variant: 'homeroom' },
};

export function getBadgeSourceMeta(source?: string | null): {
  label: string;
  variant: BadgeVariant;
} {
  if (source === 'teacher' || source === 'admin' || source === 'system') {
    return SOURCE_META[source];
  }
  return { label: 'Unknown', variant: 'neutral' };
}

export function resolveBadgeIcon(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSETS_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const resolveGiftImage = resolveBadgeIcon;
