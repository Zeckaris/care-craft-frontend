/**
 * Teacher UserContext.
 *
 * Provides the authenticated user across the entire app.
 * Fetches /auth/me on mount; exposes `setUser` so login/logout
 * can update it without a full page reload.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface TeacherUser {
  id: string;
  firstName: string;
  role: string;
  email: string;
  mfaEnabled?: boolean;
}

interface UserContextValue {
  user: TeacherUser | null;
  setUser: (user: TeacherUser | null) => void;
  isLoading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: currentUser, isLoading, refetch } = useCurrentUser();
  const [user, setUser] = useState<TeacherUser | null>(null);

  // Sync user from /auth/me response
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, refetchUser: refetch }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};
