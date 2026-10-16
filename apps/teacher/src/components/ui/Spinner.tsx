/**
 * Spinner — animated loading indicator.
 */
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full',
        'border-[var(--color-border)] border-t-[var(--color-primary)]',
        sizeMap[size],
        className,
      )}
    />
  );
}
