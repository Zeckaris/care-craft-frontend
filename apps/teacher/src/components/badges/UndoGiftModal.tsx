import { AlertTriangle } from 'lucide-react';
import type { StudentBadge } from '@carecraft/types';
import { getGiftLabel } from '@carecraft/badges';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface UndoGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  award: StudentBadge | null;
  isPending: boolean;
  onConfirm: () => Promise<void>;
}

export function UndoGiftModal({
  open,
  onOpenChange,
  award,
  isPending,
  onConfirm,
}: UndoGiftModalProps) {
  if (!award) return null;

  const liveGiftName =
    award.giftId && typeof award.giftId === 'object'
      ? award.giftId.name
      : undefined;
  const giftLabel = getGiftLabel(
    award.giftName || liveGiftName,
    award.giftQuantity ?? null,
  );

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch {
      return;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Undo gift status"
      description={`Return ${giftLabel} to Pending.`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] p-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-[var(--color-warning)]"
          />
          <div>
            <p className="text-sm font-semibold text-[var(--color-warning)]">
              This clears the gift record
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-warning)] opacity-80">
              The given date, who gave it and the gift note will be cleared.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={isPending}
            onClick={() => void handleConfirm()}
          >
            Undo gift
          </Button>
        </div>
      </div>
    </Modal>
  );
}
