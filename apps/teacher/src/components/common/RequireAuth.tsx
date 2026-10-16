/**
 * RequireAuth — route guard for teacher-only routes.
 *
 * • While the session is loading → show a full-screen spinner.
 * • If not logged in → redirect to /signin.
 * • If logged in but not a teacher → show a clear "wrong app" message.
 * • Otherwise → render children.
 */
import { Navigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Spinner } from '@/components/ui/Spinner';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLogout } from '@/hooks/useLogout';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== 'teacher') {
    return <WrongRoleScreen role={user.role} />;
  }

  return <>{children}</>;
}

function WrongRoleScreen({ role }: { role: string }) {
  const { logout } = useLogout();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 bg-[var(--color-bg)]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-danger-light)]">
        <ShieldX size={40} className="text-[var(--color-danger)]" />
      </div>
      <div className="text-center max-w-xs">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">Access denied</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          This app is only for <strong>teachers</strong>. You are signed in as a{' '}
          <strong className="capitalize">{role}</strong>.
        </p>
      </div>
      <Button variant="secondary" onClick={() => void logout()} className="w-full max-w-xs">
        Sign in with a different account
      </Button>
    </div>
  );
}
