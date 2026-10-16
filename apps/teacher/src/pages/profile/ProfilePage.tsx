/**
 * ProfilePage — teacher profile and session management.
 *
 * Displays:
 *  • Teacher personal details (name, email, role)
 *  • Online / network connectivity status
 *  • Logout button
 */
import { User, Mail, Shield, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useLogout } from '@/hooks/useLogout';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const { user } = useUser();
  const { logout } = useLogout();
  const isOnline = useOnlineStatus();

  return (
    <div className="px-4 pt-4 pb-6 space-y-4 fade-in max-w-lg mx-auto">
      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold text-2xl mb-3 shadow-inner">
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User size={32} />}
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {user?.firstName ?? 'Teacher'}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <Mail size={13} />
            <span>{user?.email}</span>
          </div>
          <div className="mt-3">
            <Badge variant="primary" className="capitalize">
              <Shield size={12} className="mr-1 inline" />
              {user?.role ?? 'Teacher'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Connectivity Status */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  isOnline
                    ? 'bg-[var(--color-success-light)] text-[var(--color-success)]'
                    : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                }`}
              >
                {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {isOnline
                    ? 'Connected to CareCraft server'
                    : 'Changes will sync when connection returns'}
                </p>
              </div>
            </div>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isOnline ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'
              }`}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Info Card */}
      <Card>
        <CardContent className="py-4 space-y-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex justify-between">
            <span>App Name</span>
            <span className="font-medium text-[var(--color-text)]">CareCraft Teacher</span>
          </div>
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-mono text-[var(--color-text)]">v1.0.0-foundation</span>
          </div>
        </CardContent>
      </Card>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          id="profile-logout-btn"
          variant="danger"
          size="lg"
          className="w-full"
          onClick={() => void logout()}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
