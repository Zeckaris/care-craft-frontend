import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

export const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>; // or spinner
  }

  if (!user) {
    // Not authenticated
    return <Navigate to="/signin" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Authenticated but role not allowed
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
