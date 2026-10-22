import { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import type { BadgeDefinition } from '@carecraft/types';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { BadgeIcon } from '@/components/badges/BadgeIcon';
import { getBadgeTierLabel } from '@/lib/badges';
import { cn } from '@/lib/utils';

interface AwardBadgeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badges: BadgeDefinition[];
  isLoading: boolean;
  error: unknown;
  isPending: boolean;
  onRetry: () => void;
  onAward: (badgeId: string, note: string) => Promise<void>;
}

export function AwardBadgeSheet({
  open,
  onOpenChange,
  badges,
  isLoading,
  error,
  isPending,
  onRetry,
  onAward,
}: AwardBadgeSheetProps) {
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedBadgeId(null);
      setNote('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedBadgeId) return;
    try {
      await onAward(selectedBadgeId, note.trim());
    } catch {
      return;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Award a badge"
      description="Choose a badge for this student. Criteria are checked by the server."
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-center">
          <p className="text-sm font-bold text-[var(--color-danger)]">
            Could not load badges
          </p>
          <p className="mt-1 text-xs text-[var(--color-danger)] opacity-80">
            {extractApiErrorMessage(error) || 'Please try again.'}
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      ) : badges.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            No badges available
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            There are no other badges available for this student this term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {badges.map((badge) => {
              const selected = selectedBadgeId === badge._id;
              return (
                <button
                  key={badge._id}
                  type="button"
                  onClick={() => setSelectedBadgeId(badge._id)}
                  aria-pressed={selected}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-[var(--radius-lg)] border p-3 text-left transition-colors',
                    selected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)]',
                  )}
                >
                  <BadgeIcon
                    icon={badge.icon}
                    name={badge.name}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[var(--color-text)]">
                          {badge.name}
                        </span>
                        <span className="block text-[11px] text-[var(--color-text-secondary)]">
                          {getBadgeTierLabel(badge.level)}
                        </span>
                      </span>
                      {selected && (
                        <Badge variant="primary">
                          <Check size={12} />
                          Selected
                        </Badge>
                      )}
                    </span>
                    {badge.description && (
                      <span className="mt-1 block text-xs text-[var(--color-text-secondary)]">
                        {badge.description}
                      </span>
                    )}
                    {badge.howToEarn && (
                      <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                        How to earn: {badge.howToEarn}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <Label htmlFor="badge-award-note">Note (optional)</Label>
            <textarea
              id="badge-award-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Add a short note about this award"
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
          </div>

          <Button
            className="w-full"
            loading={isPending}
            disabled={!selectedBadgeId}
            onClick={() => void handleSubmit()}
          >
            Award badge
          </Button>
        </div>
      )}
    </Modal>
  );
}
