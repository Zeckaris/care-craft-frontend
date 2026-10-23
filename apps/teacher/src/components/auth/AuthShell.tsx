/**
 * AuthShell - shared frame for the teacher login and signup screens.
 *
 * Matches the admin sign-in presentation: a narrow centered card with the
 * school branding (logo and name) above it when branding data is available.
 */
import type { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';
import { useBranding } from '@/context/BrandingContext';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  children: ReactNode;
  width?: 'login' | 'signup';
}

export function AuthShell({ children, width = 'login' }: AuthShellProps) {
  const { branding } = useBranding();
  const schoolName = branding?.name;
  const logoUrl = branding?.logo;

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] px-4 py-8 safe-pt safe-pb sm:py-[60px]">
      <div
        className={cn(
          'mx-auto w-full',
          width === 'signup' ? 'max-w-[480px]' : 'max-w-[400px]',
        )}
      >
        {(schoolName || logoUrl) && (
          <div className="mb-6 flex items-center justify-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={schoolName || 'School logo'}
                className="h-11 w-11 shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] object-contain"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-sm">
                <GraduationCap size={22} />
              </div>
            )}
            <div className="min-w-0 text-left">
              {schoolName && (
                <p className="truncate text-base font-semibold leading-tight text-[var(--color-text)]">
                  {schoolName}
                </p>
              )}
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                Teacher Portal
              </p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
