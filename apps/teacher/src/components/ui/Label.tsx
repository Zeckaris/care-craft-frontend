/**
 * Label — Radix Label primitive styled for forms.
 */
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'block text-sm font-medium text-[var(--color-text)] mb-1',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;
