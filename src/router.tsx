import { createBrowserRouter } from 'react-router'

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
])
