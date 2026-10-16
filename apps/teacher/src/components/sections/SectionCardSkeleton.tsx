/**
 * SectionCardSkeleton — loading placeholder for SectionCard.
 */
import { cn } from '@/lib/utils';

export function SectionCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5',
        'shadow-[var(--shadow-card)] flex flex-col justify-between h-[190px]',
        className,
      )}
      aria-hidden="true"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-5 w-44 rounded" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="flex gap-2 my-3">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-32 rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}
