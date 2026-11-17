import { Navigate, createBrowserRouter } from 'react-router'
import { Loader2 } from 'lucide-react'

import { RootLayout } from '@/components/layout/root-layout'
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
    // Admin panel: lazy-loaded so public visitors never download it.
    // TODO(auth): protect these routes once the API has authentication.
    path: '/admin',
    hydrateFallbackElement: (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 aria-label="Memuat" className="size-6 animate-spin text-primary" />
      </div>
    ),
    lazy: () =>
      import('@/pages/admin/admin-layout').then((m) => ({ Component: m.AdminLayout })),
    children: [
      {
        index: true,
        handle: { title: 'Dashboard' },
        lazy: () =>
          import('@/pages/admin/dashboard-page').then((m) => ({ Component: m.DashboardPage })),
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
])
