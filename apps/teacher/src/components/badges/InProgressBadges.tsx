import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  ListChecks,
} from 'lucide-react';
import type {
  StudentBadgeProgressCriterion,
  StudentBadgeProgressItem,
} from '@carecraft/types';
import { formatCriterionProgress } from '@carecraft/badges';
import { Badge } from '@/components/ui/Badge';
import { BadgeIcon } from '@/components/badges/BadgeIcon';
import { getBadgeTierLabel } from '@/lib/badges';
import { cn } from '@/lib/utils';

function statusBadge(status: ReturnType<typeof formatCriterionProgress>['status']) {
  switch (status) {
    case 'met':
      return (
        <Badge variant="success">
          <CheckCircle2 size={12} />
          Met
        </Badge>
      );
    case 'waiting':
      return <Badge variant="warning">Waiting</Badge>;
    case 'notApplicable':
      return <Badge variant="neutral">Not applicable</Badge>;
    case 'insufficient':
      return <Badge variant="warning">Not enough data</Badge>;
    case 'manual':
      return <Badge variant="neutral">Manual</Badge>;
    default:
      return (
        <Badge variant="neutral">
          <Clock3 size={12} />
          Pending
        </Badge>
      );
  }
}

function CriterionRow({
  criterion,
}: {
  criterion: StudentBadgeProgressCriterion;
}) {
  const progress = formatCriterionProgress(criterion);
  const canMeasure =
    progress.percent !== null && progress.status !== 'notApplicable';
  const showStateText =
    progress.stateText &&
    progress.status !== 'pending' &&
    progress.status !== 'manual';

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--color-text)]">
            {progress.typeLabel}
            {progress.scopeLabel
              ? `, ${progress.scopeLabel.toLowerCase()}`
              : ''}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
            {progress.valueText}
          </p>
        </div>
        {statusBadge(progress.status)}
      </div>

      {canMeasure && (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-raised)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.percent ?? 0)}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all',
              progress.status === 'met'
                ? 'bg-[var(--color-success)]'
                : 'bg-[var(--color-primary)]',
            )}
            style={{ width: `${progress.percent ?? 0}%` }}
          />
        </div>
      )}

      {showStateText && (
        <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
          {progress.stateText}
        </p>
      )}

      {progress.detailText && (
        <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
          {progress.detailText}
        </p>
      )}
    </div>
  );
}

export function InProgressBadges({
  items,
}: {
  items: StudentBadgeProgressItem[];
}) {
  const [open, setOpen] = useState(false);
  const inProgress = useMemo(
    () =>
      items
        .filter((item) => item.badge.autoAward && !item.earned)
        .sort((a, b) => a.badge.level - b.badge.level),
    [items],
  );

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-info-light)] text-[var(--color-info)]">
          <ListChecks size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[var(--color-text)]">
            In progress
          </span>
          <span className="block text-xs text-[var(--color-text-secondary)]">
            {inProgress.length} auto-award badge
            {inProgress.length === 1 ? '' : 's'} to work toward
          </span>
        </span>
        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-[var(--color-text-muted)] transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-[var(--color-border)] p-4">
          {inProgress.length === 0 && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              No auto-award badges are in progress right now.
            </p>
          )}

          {inProgress.map((item) => (
            <div key={item.badge._id} className="space-y-2">
              <div className="flex items-center gap-2.5">
                <BadgeIcon
                  icon={item.badge.icon}
                  name={item.badge.name}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[var(--color-text)]">
                    {item.badge.name}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    {getBadgeTierLabel(item.badge.level)}
                  </p>
                  {item.badge.howToEarn && (
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      How to earn: {item.badge.howToEarn}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {item.criteria.map((criterion) => (
                  <CriterionRow
                    key={criterion.criterionId}
                    criterion={criterion}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
