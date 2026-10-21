/**
 * Teacher app router configuration.
 *
 * Routes:
 *  • /signin                Login page (email/pwd + optional MFA)
 *  • /app                   Protected layout (RequireAuth + AppShell)
 *    ├── /app/home          Sections list (Home)
 *    ├── /app/schedule      My published timetable
 *    ├── /app/sections/:id  Section details and student roster
 *    ├── /app/attributes    Homeroom student attributes (feature-gated)
 *    ├── /app/observations  Student observations (feature-gated)
 *    └── /app/profile       Profile & logout
 *  • /                      Redirects to /app/home
 *  • *                      Catch-all redirects to /app/home
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import HomePage from '@/pages/home/HomePage';
import MySchedulePage from '@/pages/schedule/MySchedulePage';
import SectionDetailPage from '@/pages/sections/SectionDetailPage';
import SectionRosterPage from '@/pages/sections/SectionRosterPage';
import AttendancePage from '@/pages/attendance/AttendancePage';
import GradesSubjectPickerPage from '@/pages/grades/GradesSubjectPickerPage';
import ClassSheetPage from '@/pages/grades/ClassSheetPage';
import MarkEntryPage from '@/pages/grades/MarkEntryPage';
import AttributeSectionsPage from '@/pages/attributes/AttributeSectionsPage';
import AttributeRosterPage from '@/pages/attributes/AttributeRosterPage';
import AttributeEvaluationPage from '@/pages/attributes/AttributeEvaluationPage';
import ObservationsPage from '@/pages/observations/ObservationsPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/common/RequireAuth';
import { RequireFeature } from '@/components/common/RequireFeature';

export const router = createBrowserRouter([
  {
    path: '/signin',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'schedule',
        element: <MySchedulePage />,
      },
      {
        path: 'sections/:sectionId',
        element: <SectionDetailPage />,
      },
      {
        path: 'sections/:sectionId/roster',
        element: <SectionRosterPage />,
      },
      {
        path: 'sections/:sectionId/attendance',
        element: <AttendancePage />,
      },
      {
        path: 'sections/:sectionId/grades',
        element: <GradesSubjectPickerPage />,
      },
      {
        path: 'sections/:sectionId/grades/:subjectId',
        element: <ClassSheetPage />,
      },
      {
        path: 'sections/:sectionId/grades/:subjectId/marks/:typeId',
        element: <MarkEntryPage />,
      },
      {
        path: 'attributes',
        element: (
          <RequireFeature feature="attributeEvaluation">
            <AttributeSectionsPage />
          </RequireFeature>
        ),
      },
      {
        path: 'attributes/:sectionId',
        element: (
          <RequireFeature feature="attributeEvaluation">
            <AttributeRosterPage />
          </RequireFeature>
        ),
      },
      {
        path: 'attributes/:sectionId/:studentId',
        element: (
          <RequireFeature feature="attributeEvaluation">
            <AttributeEvaluationPage />
          </RequireFeature>
        ),
      },
      {
        path: 'observations',
        element: (
          <RequireFeature feature="observations">
            <ObservationsPage />
          </RequireFeature>
        ),
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        index: true,
        element: <Navigate to="/app/home" replace />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/app/home" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/app/home" replace />,
  },
]);
