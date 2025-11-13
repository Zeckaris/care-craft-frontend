import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/features/admin/pages/DashboardPage";
import AdminSignupPage from "@/features/auth/pages/AdminSignupPage";
import InviteAdminPage from "@/features/auth/pages/InvitationPage";
import SignInPage from "./features/auth/pages/SignInPage";
import { SchoolInfoPage } from "./features/admin/pages/SchoolInfoPage";
import GradesPage from "./features/admin/pages/GradesPage";
import StudentsPage from "./features/admin/pages/StudentsPage";
import SubjectsPage from "./features/admin/pages/SubjectsPage";
import AssessmentTypesPage from "./features/admin/pages/assessments/AssessmentTypesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
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
      {
        path: "/subjects",
        element: <SubjectsPage />,
        handle: { crumb: () => "Subjects" },
      },

      {
        path: "assessments",
        handle: { crumb: () => "Assessments" },
        children: [
          {
            index: true,
            element: <Navigate to="types" replace />,
          },
          {
            path: "types",
            element: <AssessmentTypesPage />,
            handle: { crumb: () => "Types" },
          },
          // {
          //   path: "setup",
          //   element: <AssessmentSetupPage />,
          //   handle: { crumb: () => "Setup" },
          // },
        ],
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
