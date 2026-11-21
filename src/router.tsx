import { Navigate, createBrowserRouter } from 'react-router'

import { GuestOnly, RequireAdmin } from '@/components/auth/route-guards'
import { RootLayout } from '@/components/layout/root-layout'
import { PageSpinner } from '@/components/page-spinner'
import { LoginPage } from '@/pages/auth/login-page'
import { RegisterPage } from '@/pages/auth/register-page'
import { ComingSoonPage } from '@/pages/coming-soon-page'
import { LandingPage } from '@/pages/landing/landing-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'kamus', element: <ComingSoonPage title="Kamus Abjad" /> },
      { path: 'edukasi', element: <ComingSoonPage title="Edukasi" /> },
      { path: 'kuis', element: <ComingSoonPage title="Kuis" /> },
      {
        // Logged-in users are redirected by role (admin → /admin, user → /).
        element: <GuestOnly />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        path: '*',
        element: (
          <ComingSoonPage
            title="Halaman tidak ditemukan"
            description="Halaman yang kamu cari tidak tersedia."
          />
        ),
      },
    ],
  },
  {
    // Admins only: logged-out visitors go to /login, users go to /.
    path: '/admin',
    element: <RequireAdmin />,
    hydrateFallbackElement: <PageSpinner fullScreen />,
    children: [
      {
        // Lazy-loaded so visitors of the public pages never download the admin panel.
        lazy: () =>
          import('@/pages/admin/admin-layout').then((m) => ({ Component: m.AdminLayout })),
        children: [
          {
            index: true,
            handle: { title: 'Dashboard' },
            lazy: () =>
              import('@/pages/admin/dashboard-page').then((m) => ({
                Component: m.DashboardPage,
              })),
          },
          {
            path: 'letters',
            handle: { title: 'Letters' },
            lazy: () =>
              import('@/pages/admin/letters/letters-page').then((m) => ({
                Component: m.LettersPage,
              })),
          },
          {
            path: 'users',
            handle: { title: 'Users' },
            lazy: () =>
              import('@/pages/admin/users/users-page').then((m) => ({ Component: m.UsersPage })),
          },
          {
            path: 'education-news',
            handle: { title: 'Education News' },
            lazy: () =>
              import('@/pages/admin/education-news/news-page').then((m) => ({
                Component: m.EducationNewsPage,
              })),
          },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },
])
