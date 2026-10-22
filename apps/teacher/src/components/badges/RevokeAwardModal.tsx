import { AlertTriangle } from 'lucide-react';
import type { StudentBadge } from '@carecraft/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface RevokeAwardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  award: StudentBadge | null;
  isPending: boolean;
  onConfirm: () => Promise<void>;
}

export function RevokeAwardModal({
  open,
  onOpenChange,
  award,
  isPending,
  onConfirm,
}: RevokeAwardModalProps) {
  if (!award) return null;

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
      title="Revoke badge"
      description={`Remove ${award.badgeId?.name ?? 'this badge'} from this student.`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-[var(--color-danger)]"
          />
          <div>
            <p className="text-sm font-semibold text-[var(--color-danger)]">
              This cannot be undone
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-danger)] opacity-80">
              The badge award will be removed for the current term.
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
            Revoke badge
          </Button>
        </div>
      </div>
    </Modal>
  );
}
