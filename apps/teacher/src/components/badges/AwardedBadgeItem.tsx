import { Gift, Pencil, Trash2 } from 'lucide-react';
import type { StudentBadge } from '@carecraft/types';
import {
  GIFT_CLAIM_NOTICE,
  awardHasGift,
  getGiftLabel,
  getGiftStatusLabel,
} from '@carecraft/badges';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BadgeIcon } from '@/components/badges/BadgeIcon';
import { GiftThumb } from '@/components/badges/GiftThumb';
import { formatDate, formatDateTime } from '@/lib/format';
import {
  getBadgeSourceMeta,
  getBadgeTierLabel,
} from '@/lib/badges';

function awardedByName(award: StudentBadge): string {
  if (award.source === 'system') return 'System';
  if (!award.awardedBy) return 'Unknown user';
  return (
    [award.awardedBy.firstName, award.awardedBy.lastName]
      .filter(Boolean)
      .join(' ') || 'Unknown user'
  );
}

function giftGivenByName(award: StudentBadge): string {
  if (!award.giftGivenBy) return 'Unknown user';
  return (
    [award.giftGivenBy.firstName, award.giftGivenBy.lastName]
      .filter(Boolean)
      .join(' ') || 'Unknown user'
  );
}

interface AwardedBadgeItemProps {
  award: StudentBadge;
  canEdit: boolean;
  canRevoke: boolean;
  canManageGift: boolean;
  onEdit: (award: StudentBadge) => void;
  onRevoke: (award: StudentBadge) => void;
  onMarkGiftGiven: (award: StudentBadge) => void;
  onUndoGift: (award: StudentBadge) => void;
}

export function AwardedBadgeItem({
  award,
  canEdit,
  canRevoke,
  canManageGift,
  onEdit,
  onRevoke,
  onMarkGiftGiven,
  onUndoGift,
}: AwardedBadgeItemProps) {
  const badge = award.badgeId;
  const source = getBadgeSourceMeta(award.source);
  const note = award.note?.trim() || 'No note';
  const hasGift = awardHasGift(award);
  const giftStatus = award.giftStatus ?? 'none';
  const giftStatusLabel = getGiftStatusLabel(giftStatus);
  const liveGiftName =
    award.giftId && typeof award.giftId === 'object'
      ? award.giftId.name
      : undefined;
  const giftName = award.giftName || liveGiftName;
  const giftImage =
    award.giftId && typeof award.giftId === 'object'
      ? award.giftId.image
      : undefined;
  const claimPassed = award.giftClaimBy
    ? new Date(award.giftClaimBy).getTime() < Date.now()
    : false;

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <BadgeIcon icon={badge?.icon} name={badge?.name ?? 'Badge'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[var(--color-text)]">
                {badge?.name ?? 'Deleted badge'}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {getBadgeTierLabel(badge?.level)}
              </p>
              {badge?.howToEarn && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  How to earn: {badge.howToEarn}
                </p>
              )}
            </div>
            <Badge variant={source.variant}>{source.label}</Badge>
          </div>

          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Awarded by {awardedByName(award)} on{' '}
            {formatDateTime(award.createdAt)}
          </p>

          <div className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] px-2.5 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Note
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-xs text-[var(--color-text-secondary)]">
              {note}
            </p>
          </div>

          {hasGift && (
            <div className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-2">
              <div className="flex items-start gap-2.5">
                <GiftThumb image={giftImage} name={giftName ?? 'Gift'} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        <Gift size={12} /> Gift
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-[var(--color-text)]">
                        {getGiftLabel(
                          giftName,
                          award.giftQuantity ?? null,
                        )}
                      </p>
                    </div>
                    {giftStatusLabel && (
                      <Badge
                        variant={giftStatus === 'given' ? 'success' : 'warning'}
                      >
                        {giftStatusLabel}
                      </Badge>
                    )}
                  </div>

                  {giftStatus === 'pending' && (
                    <div className="mt-1">
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        {GIFT_CLAIM_NOTICE}
                        {award.giftClaimBy
                          ? `, by ${formatDate(award.giftClaimBy)}.`
                          : '.'}
                      </p>
                      {claimPassed && (
                        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                          The claim window has passed, but you can still mark
                          this gift as given.
                        </p>
                      )}
                    </div>
                  )}

                  {giftStatus === 'given' && (
                    <div className="mt-1">
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        Given by {giftGivenByName(award)}
                        {award.giftGivenAt
                          ? ` on ${formatDateTime(award.giftGivenAt)}`
                          : ''}
                      </p>
                      {award.giftNote && (
                        <p className="mt-0.5 whitespace-pre-wrap text-[11px] text-[var(--color-text-muted)]">
                          Gift note: {award.giftNote}
                        </p>
                      )}
                    </div>
                  )}

                  {canManageGift && giftStatus === 'pending' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => onMarkGiftGiven(award)}
                    >
                      <Gift size={14} />
                      Mark gift as given
                    </Button>
                  )}
                  {canManageGift && giftStatus === 'given' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => onUndoGift(award)}
                    >
                      Undo gift status
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {(canEdit || canRevoke) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(award)}
                >
                  <Pencil size={14} />
                  Edit note
                </Button>
              )}
              {canRevoke && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)]"
                  onClick={() => onRevoke(award)}
                >
                  <Trash2 size={14} />
                  Revoke
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
