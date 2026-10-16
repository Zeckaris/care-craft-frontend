/**
 * Badge — small inline status/label chip.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        primary:  'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
        success:  'bg-[var(--color-success-light)] text-[var(--color-success)]',
        warning:  'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
        danger:   'bg-[var(--color-danger-light)]  text-[var(--color-danger)]',
        info:     'bg-[var(--color-info-light)]    text-[var(--color-info)]',
        homeroom: 'bg-[var(--color-homeroom-light)] text-[var(--color-homeroom)]',
        neutral:  'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
