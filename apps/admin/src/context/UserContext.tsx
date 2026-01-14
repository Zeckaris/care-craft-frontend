import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface User {
  id: string;
  firstName: string;
  role: string;
  email: string;
  mfaEnabled?: boolean;
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: currentUser, isLoading, refetch } = useCurrentUser();
  const [user, setUser] = useState<User | null>(null);

  // Sync user from useCurrentUser
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  return (
    <UserContext.Provider
      value={{ user, setUser, isLoading, refetchUser: refetch }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
