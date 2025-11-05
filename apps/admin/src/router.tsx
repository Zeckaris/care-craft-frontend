import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/features/admin/pages/DashboardPage";
import AdminSignupPage from "@/features/auth/pages/AdminSignupPage";
import InviteAdminPage from "@/features/auth/pages/InvitationPage";
import SignInPage from "./features/auth/pages/SignInPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
        handle: { crumb: () => "Dashboard" },
      },
      // We'll add more admin routes later
      {
        path: "signin",
        element: <SignInPage />,
      },
      {
        path: "signup",
        element: <AdminSignupPage />,
      },
    ],
  },
  {
    path: "/signup",
    element: <AdminSignupPage />,
  },
  {
    path: "/invite",
    element: <InviteAdminPage />,
  },
]);
