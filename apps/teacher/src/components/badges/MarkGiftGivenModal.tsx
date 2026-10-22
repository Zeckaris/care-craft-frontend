import { useEffect, useState } from 'react';
import type { StudentBadge } from '@carecraft/types';
import { getGiftLabel } from '@carecraft/badges';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';

interface MarkGiftGivenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  award: StudentBadge | null;
  isPending: boolean;
  onSave: (note?: string) => Promise<void>;
}

export function MarkGiftGivenModal({
  open,
  onOpenChange,
  award,
  isPending,
  onSave,
}: MarkGiftGivenModalProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setNote('');
    }
  }, [open]);

  if (!award) return null;

  const liveGiftName =
    award.giftId && typeof award.giftId === 'object'
      ? award.giftId.name
      : undefined;
  const giftLabel = getGiftLabel(
    award.giftName || liveGiftName,
    award.giftQuantity ?? null,
  );

  const handleSubmit = async () => {
    try {
      await onSave(note.trim() || undefined);
    } catch {
      return;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Mark gift as given"
      description={`Confirm that ${giftLabel} was given to this student.`}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="gift-given-note">Note (optional)</Label>
          <textarea
            id="gift-given-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Add a note about this gift"
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
          <p className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">
            {note.length}/300
          </p>
        </div>
        <Button
          className="w-full"
          loading={isPending}
          onClick={() => void handleSubmit()}
        >
          Mark gift as given
        </Button>
      </div>
    </Modal>
  );
}
