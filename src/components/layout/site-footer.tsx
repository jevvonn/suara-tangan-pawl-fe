import { Link } from 'react-router'

import { BrandMark } from '@/components/layout/brand-mark'
import groupsIcon from '@/assets/landing/icon-groups.svg'
import licenseIcon from '@/assets/landing/icon-license.svg'
import verifiedIcon from '@/assets/landing/icon-verified.svg'
import volunteerIcon from '@/assets/landing/icon-volunteer.svg'

const moduleLinks = [
  { label: 'Kamus Abjad & Angka', to: '/kamus' },
  { label: 'Penerjemah Kalimat Harian', to: '/' },
  { label: 'Berita & Materi Edukasi', to: '/edukasi' },
  { label: 'Kalimat Favorit', to: '/favorit' },
]

const communityLinks = [
  { label: 'Forum Teman Tuli Nusantara', icon: groupsIcon },
  { label: 'Kolaborasi Relawan & Guru', icon: volunteerIcon },
  { label: 'Lisensi CC-BY-SA Edukasi', icon: licenseIcon },
]

const legalLinks = [
  'Panduan Aksesibilitas',
  'Kebijakan Privasi',
  'Kontak Dukungan',
]

const columnHeading =
  'text-[15px] leading-5 font-bold tracking-[0.15px] text-foreground'
const columnLink =
  'text-sm text-muted-foreground transition-colors hover:text-foreground'
const smallBold =
  'text-[11px] leading-4 font-bold tracking-[0.44px] text-muted-foreground'

export function SiteFooter() {
  return (
    <footer className="bg-surface-low px-4 sm:px-10">
      <div className="mx-auto max-w-[1200px] py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[150px]">
          <div className="flex flex-col items-start gap-2 md:col-span-2">
            <BrandMark />
            <p className="max-w-[448px] text-base text-muted-foreground">
              Kenali bahasa isyarat, jembatani komunikasi. Ruang inklusif{' '}
              <br className="hidden lg:block" />
              terbuka untuk belajar BISINDO dan SIBI bersama Teman Tuli{' '}
              <br className="hidden lg:block" />
              dan Teman Dengar se-Indonesia.
            </p>
            <p className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
              <img src={verifiedIcon} alt="" />
              <span className={smallBold}>
                Standar Kurikulum Terbuka SIBI &amp; BISINDO 2024
              </span>
            </p>
          </div>

          <nav aria-labelledby="footer-modules" className="flex flex-col gap-2">
            <h2 id="footer-modules" className={columnHeading}>
              Jelajah Modul
            </h2>
            <ul className="flex flex-col gap-2">
              {moduleLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={`block ${columnLink}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-community"
            className="flex flex-col gap-2"
          >
            <h2 id="footer-community" className={columnHeading}>
              Komunitas &amp; Hak Cipta
            </h2>
            <ul className="flex flex-col gap-2">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href="#"
                    className={`flex items-center gap-1.5 ${columnLink}`}
                  >
                    <img src={link.icon} alt="" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <p className={smallBold}>
            © 2024 Suara Tangan Indonesia. Aksesibilitas universal untuk semua
            insan.
          </p>
          <ul className="flex flex-wrap items-center gap-4">
            {legalLinks.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  className={`block ${smallBold} transition-colors hover:text-foreground`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
