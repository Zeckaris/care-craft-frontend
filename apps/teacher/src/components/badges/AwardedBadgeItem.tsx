import { Pencil, Trash2 } from 'lucide-react';
import type { StudentBadge } from '@carecraft/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BadgeIcon } from '@/components/badges/BadgeIcon';
import { formatDateTime } from '@/lib/format';
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

interface AwardedBadgeItemProps {
  award: StudentBadge;
  canEdit: boolean;
  canRevoke: boolean;
  onEdit: (award: StudentBadge) => void;
  onRevoke: (award: StudentBadge) => void;
}

export function AwardedBadgeItem({
  award,
  canEdit,
  canRevoke,
  onEdit,
  onRevoke,
}: AwardedBadgeItemProps) {
  const badge = award.badgeId;
  const source = getBadgeSourceMeta(award.source);
  const note = award.note?.trim() || 'No note';

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
