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
import AssessmentSetupPage from "./features/admin/pages/assessments/AssessmentSetupPage";
import ParentsPage from "./features/admin/pages/users/ParentsPage";
import TeachersPage from "./features/admin/pages/users/TeachersPage";
import CoordinatorsPage from "./features/admin/pages/users/CoordinatorsPage";
import EnrollPage from "./features/admin/pages/EnrollPage";
import AcademicCalendarPage from "./features/admin/pages/AcademicCalendarPage";
import GradeSubjectAssessmentsPage from "./features/admin/pages/GradeSubjectAssessmentsPage";
import AttributeCategoriesPage from "./features/admin/pages/AttributeCategoriesPage";
import AttributeEvaluationsPage from "./features/admin/pages/AttributeEvaluationsPage";
import ActionPlansPage from "@/features/admin/pages/ActionPlansPage";

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
        path: "/parents",
        element: <ParentsPage />,
        handle: { crumb: () => "Parents" },
      },
      {
        path: "/teachers",
        element: <TeachersPage />,
        handle: { crumb: () => "Teachers" },
      },
      {
        path: "/coordinators",
        element: <CoordinatorsPage />,
        handle: { crumb: () => "Coordinators" },
      },
      {
        path: "/enroll",
        element: <EnrollPage />,
        handle: { crumb: () => "Enroll" },
      },
      {
        path: "/calendar",
        element: <AcademicCalendarPage />,
        handle: { crumb: () => "Enroll" },
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
          {
            path: "setup",
            element: <AssessmentSetupPage />,
            handle: { crumb: () => "Setup" },
          },
        ],
      },
      {
        path: "/gsa",
        element: <GradeSubjectAssessmentsPage />,
        handle: { crumb: () => "Assign Subject & Assessment Setup For Grades" },
      },
      {
        path: "/attribute-categories",
        element: <AttributeCategoriesPage />,
        handle: { crumb: () => "Attribute Category" },
      },
      {
        path: "/attribute-evaluations",
        element: <AttributeEvaluationsPage />,
        handle: { crumb: () => "Attribute Evaluation" },
      },
      {
        path: "/action-plans",
        element: <ActionPlansPage />,
        handle: { crumb: () => "Action Plans" },
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
