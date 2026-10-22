import { useEffect, useState } from 'react';
import type { StudentBadge } from '@carecraft/types';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';

interface EditAwardNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  award: StudentBadge | null;
  isPending: boolean;
  onSave: (note: string | null) => Promise<void>;
}

export function EditAwardNoteModal({
  open,
  onOpenChange,
  award,
  isPending,
  onSave,
}: EditAwardNoteModalProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open && award) {
      setNote(award.note ?? '');
    }
  }, [open, award]);

  if (!award) return null;

  const handleSubmit = async () => {
    try {
      await onSave(note.trim() || null);
    } catch {
      return;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit note"
      description={`Update the note for ${award.badgeId?.name ?? 'this award'}.`}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="badge-note-edit">Note</Label>
          <textarea
            id="badge-note-edit"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Add a short note about this award"
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
        </div>
        <Button
          className="w-full"
          loading={isPending}
          onClick={() => void handleSubmit()}
        >
          Save note
        </Button>
      </div>
    </Modal>
  );
}
