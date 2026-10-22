/**
 * Teacher UserContext.
 *
 * Provides the authenticated user across the entire app.
 * Fetches /auth/me on mount; exposes `setUser` so login/logout
 * can update it without a full page reload.
 */
import {
  createContext,
  useCallback,
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
  /**
   * Increments on every successful sign-in (including the MFA step). Consumers
   * that need to react to a re-login of the *same* account can depend on this
   * instead of the user id, which would not change.
   */
  sessionKey: number;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * `/auth/me` returns the raw Mongoose user document, which uses `_id` and
 * serialises no `id` virtual. Normalise it to the `TeacherUser` shape so
 * consumers (e.g. attendance queue ownership) always get a stable `id`.
 */
function normalizeUser(raw: (TeacherUser & { _id?: string }) | null): TeacherUser | null {
  if (!raw) return null;
  const id = raw.id || raw._id;
  if (!id) return null;
  return {
    id,
    firstName: raw.firstName,
    role: raw.role,
    email: raw.email,
    mfaEnabled: raw.mfaEnabled,
  };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: currentUser, isLoading, refetch } = useCurrentUser();
  const [user, setUser] = useState<TeacherUser | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const setUserAndBumpSession = useCallback((next: TeacherUser | null) => {
    const normalized = normalizeUser(next);
    setUser(normalized);
    if (normalized) setSessionKey((key) => key + 1);
  }, []);

  // Sync user from /auth/me response
  useEffect(() => {
    if (currentUser) {
      setUserAndBumpSession(currentUser);
    }
  }, [currentUser, setUserAndBumpSession]);

  return (
    <UserContext.Provider
      value={{ user, setUser: setUserAndBumpSession, isLoading, refetchUser: refetch, sessionKey }}
    >
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
