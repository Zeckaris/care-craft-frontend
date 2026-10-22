import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/features/admin/pages/DashboardPage";
import AttendancePage from "@/features/admin/pages/AttendancePage";
import AdminSignupPage from "@/features/auth/pages/AdminSignupPage";
import InviteAdminPage from "@/features/auth/pages/InvitationPage";
import SignInPage from "./features/auth/pages/SignInPage";
import { SchoolInfoPage } from "./features/admin/pages/SchoolInfoPage";
import GradesPage from "./features/admin/pages/GradesPage";
import StudentsPage from "./features/admin/pages/StudentsPage";
import SubjectsPage from "./features/admin/pages/SubjectsPage";
import AssessmentTypesPage from "./features/admin/pages/assessments/AssessmentTypesPage";
import AssessmentSetupPage from "./features/admin/pages/assessments/AssessmentSetupPage";
import AssessmentResultsPage from "./features/admin/pages/assessments/AssessmentResultsPage";
import ParentsPage from "./features/admin/pages/users/ParentsPage";
import TeachersPage from "./features/admin/pages/users/TeachersPage";
import CoordinatorsPage from "./features/admin/pages/users/CoordinatorsPage";
import EnrollPage from "./features/admin/pages/EnrollPage";
import AcademicCalendarPage from "./features/admin/pages/AcademicCalendarPage";
import GradeSubjectAssessmentsPage from "./features/admin/pages/GradeSubjectAssessmentsPage";
import AttributeCategoriesPage from "./features/admin/pages/AttributeCategoriesPage";
import AttributeEvaluationsPage from "./features/admin/pages/AttributeEvaluationsPage";
import BadgeDefinitionsPage from "./features/admin/pages/badge/BadgeDefinitionsPage";
import BadgeAwardsPage from "./features/admin/pages/badge/BadgeAwardsPage";
import GiftsPage from "./features/admin/pages/badge/GiftsPage";
import ObservationsPage from "./features/admin/pages/ObservationsPage";
import { SettingsPage } from "./features/admin/pages/SettingsPage";
import { NotificationsPage } from "./features/admin/pages/NotificationsPage";
import SectionsPage from "./features/admin/pages/SectionsPage";
import SchedulePage from "./features/admin/pages/SchedulePage";
import { RequireAuth } from "@/components/common/RequireAuth";
import LandingPage from "@/public/pages/LandingPage";
import FeaturesPage from "@/public/pages/FeaturesPage";
import AboutPage from "@/public/pages/AboutPage";
import PublicLayout from "@/public/PublicLayout";

export const router = createBrowserRouter([
  // 1. Public root
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "features",
        element: <FeaturesPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
    ],
  },
  // 2. Auth pages (public)
  {
    path: "/signup",
    element: <AdminSignupPage />,
  },
  {
    path: "/signin",
    element: <SignInPage />,
  },

  // 3. Protected admin routes
  {
    path: "/app",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },

      {
        path: "dashboard",
        element: <DashboardPage />,
        handle: { crumb: () => "Dashboard" },
      },
      {
        path: "attendance",
        element: <AttendancePage />,
        handle: { crumb: () => "Attendance" },
      },
      {
        path: "school-info",
        element: <SchoolInfoPage />,
        handle: { crumb: () => "School Info" },
      },
      {
        path: "grades",
        element: <GradesPage />,
        handle: { crumb: () => "Grades" },
      },
      {
        path: "students",
        element: <StudentsPage />,
        handle: { crumb: () => "Students" },
      },
      {
        path: "subjects",
        element: <SubjectsPage />,
        handle: { crumb: () => "Subjects" },
      },
      {
        path: "parents",
        element: <ParentsPage />,
        handle: { crumb: () => "Parents" },
      },
      {
        path: "teachers",
        element: <TeachersPage />,
        handle: { crumb: () => "Teachers" },
      },
      {
        path: "settings",
        element: <SettingsPage />,
        handle: { crumb: () => "Settings" },
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
        handle: { crumb: () => "Notifications" },
      },
      {
        path: "coordinators",
        element: <CoordinatorsPage />,
        handle: { crumb: () => "Coordinators" },
      },
      {
        path: "enroll",
        element: <EnrollPage />,
        handle: { crumb: () => "Enroll" },
      },
      {
        path: "calendar",
        element: <AcademicCalendarPage />,
        handle: { crumb: () => "Calendar" },
      },
      {
        path: "observations",
        element: <ObservationsPage />,
        handle: { crumb: () => "Observations" },
      },
      {
        path: "assessments",
        handle: { crumb: () => "Assessments" },
        children: [
          { index: true, element: <Navigate to="types" replace /> },
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
          {
            path: "results",
            element: (
              <RequireAuth roles={["admin", "coordinator"]}>
                <AssessmentResultsPage />
              </RequireAuth>
            ),
            handle: { crumb: () => "Results" },
          },
        ],
      },
      {
        path: "gsa",
        element: <GradeSubjectAssessmentsPage />,
        handle: { crumb: () => "Assign Subject & Assessment Setup For Grades" },
      },
      {
        path: "sections",
        element: <SectionsPage />,
        handle: { crumb: () => "Sections" },
      },
      {
        path: "schedule",
        element: <SchedulePage />,
        handle: { crumb: () => "Schedule" },
      },
      {
        path: "attribute-categories",
        element: <AttributeCategoriesPage />,
        handle: { crumb: () => "Attribute Category" },
      },
      {
        path: "attribute-evaluations",
        element: <AttributeEvaluationsPage />,
        handle: { crumb: () => "Attribute Evaluation" },
      },
      {
        path: "badges",
        handle: { crumb: () => "Badges" },
        children: [
          { index: true, element: <Navigate to="definitions" replace /> },
          {
            path: "definitions",
            element: <BadgeDefinitionsPage />,
            handle: { crumb: () => "Definitions" },
          },
          {
            path: "criteria",
            element: <Navigate to="/app/badges/definitions" replace />,
          },
          {
            path: "awards",
            element: <BadgeAwardsPage />,
            handle: { crumb: () => "Awards" },
          },
          {
            path: "gifts",
            element: <GiftsPage />,
            handle: { crumb: () => "Gifts" },
          },
        ],
      },
    ],
  },

  // 4. Protected invite
  {
    path: "/invite",
    element: (
      <RequireAuth roles={["admin", "coordinator"]}>
        <InviteAdminPage />
      </RequireAuth>
    ),
  },

  // 5. 404 fallback
  {
    path: "*",
    element: (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <a href="/">Back to Home</a>
      </div>
    ),
  },
]);
