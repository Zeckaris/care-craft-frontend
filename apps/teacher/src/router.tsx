/**
 * Teacher app router configuration.
 *
 * Routes:
 *  • /signin                Login page (email/pwd + optional MFA)
 *  • /app                   Protected layout (RequireAuth + AppShell)
 *    ├── /app/home          Sections list (Home)
 *    ├── /app/schedule      My published timetable
 *    ├── /app/sections/:id  Section placeholder
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
import AttendancePage from '@/pages/attendance/AttendancePage';
import ProfilePage from '@/pages/profile/ProfilePage';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/common/RequireAuth';

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
        path: 'sections/:sectionId/attendance',
        element: <AttendancePage />,
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
