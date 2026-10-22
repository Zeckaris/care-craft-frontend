import type { GiftOption, GiftStatus, StudentBadge } from '@carecraft/types';

export const GIFT_CLAIM_NOTICE = 'Claim within 30 days of the award';

export function getGiftOptionId(
  gift?: GiftOption | string | null,
): string | null {
  if (!gift) return null;
  return typeof gift === 'string' ? gift : gift._id;
}

export function getGiftLabel(
  name?: string | null,
  quantity?: number | null,
): string {
  const label = name?.trim() || 'Gift';
  if (quantity === null || quantity === undefined || !Number.isFinite(quantity)) {
    return label;
  }
  return `${label} x ${quantity}`;
}

export function getGiftStatusLabel(status?: GiftStatus | string | null): string {
  if (status === 'pending') return 'Pending';
  if (status === 'given') return 'Given';
  return '';
}

export function getGiftClaimNotice(): string {
  return GIFT_CLAIM_NOTICE;
}

type GiftCarrier = Pick<StudentBadge, 'giftId' | 'giftName' | 'giftStatus'>;

/** Legacy awards can omit most gift keys, so every field is optional. */
export function awardHasGift(award?: GiftCarrier | null): boolean {
  if (!award) return false;
  if (award.giftName) return true;
  if (award.giftId) return true;
  return Boolean(award.giftStatus && award.giftStatus !== 'none');
}
