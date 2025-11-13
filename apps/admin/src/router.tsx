import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/features/admin/pages/DashboardPage";
import AdminSignupPage from "@/features/auth/pages/AdminSignupPage";
import InviteAdminPage from "@/features/auth/pages/InvitationPage";
import SignInPage from "./features/auth/pages/SignInPage";
import { SchoolInfoPage } from "./features/admin/pages/SchoolInfoPage";
import GradesPage from "./features/admin/pages/GradesPage";
import StudentsPage from "./features/admin/pages/StudentsPage";

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
      {
        path: "/school-info",
        element: <SchoolInfoPage />,
        handle: { crumb: () => "School Info" },
      },
      {
        path: "/grades",
        element: <GradesPage />,
        handle: { crumb: () => "Grades" },
      },
      {
        path: "/students",
        element: <StudentsPage />,
        handle: { crumb: () => "Students" },
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
