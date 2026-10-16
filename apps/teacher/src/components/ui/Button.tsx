/**
 * Button — Radix Slot-backed button with CVA variants.
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)]',
    'text-sm font-semibold transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'touch-target select-none',
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)]',
        secondary:
          'bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border)]',
        ghost:
          'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]',
        danger:
          'bg-[var(--color-danger)] text-[var(--color-danger-fg)] hover:opacity-90',
        link:
          'text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-12 px-5 py-2',
        sm:      'h-9  px-3 py-1 text-xs',
        lg:      'h-14 px-6 py-3 text-base',
        icon:    'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), loading && 'opacity-70 cursor-not-allowed')}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" className="mr-2 inline-block shrink-0" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

// eslint-disable-next-line react-refresh/only-export-components
export { buttonVariants };
