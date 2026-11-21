import { Link, NavLink } from 'react-router'

import { BrandMark } from '@/components/layout/brand-mark'
import { Button } from '@/components/ui/button'
import { mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import playCircleIcon from '@/assets/landing/icon-play-circle.svg'

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/90 px-4 shadow-[0_4px_20px_0_rgb(41_37_36/0.06)] backdrop-blur-[24px] sm:px-10">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between sm:px-8">
        <Link to="/" aria-label="Suara Tangan — Beranda">
          <BrandMark textClassName="tracking-[-0.5px]" />
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 rounded-full bg-surface-low p-1 lg:flex"
        >
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 font-bold whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-base leading-6 text-primary-foreground drop-shadow-[0_2px_0_var(--color-primary-foreground)]'
                    : 'text-[15px] leading-5 tracking-[0.15px] text-muted-foreground hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            variant="ghost"
            className="h-10 rounded-full bg-surface-low px-5 text-[15px] leading-5 font-bold tracking-[0.15px] text-foreground hover:bg-secondary hover:text-foreground"
          >
            <NavLink to="/login">Masuk</NavLink>
          </Button>
          <Button
            asChild
            className="h-auto gap-2 rounded-full border-0 px-3.5 py-2.5 text-[15px] leading-5 font-bold tracking-[0.15px] drop-shadow-[0_4px_0_var(--color-primary-foreground)] hover:bg-primary/90 sm:px-5"
          >
            <Link to="/kamus" aria-label="Mulai Belajar">
              <img src={playCircleIcon} alt="" />
              {/* Icon-only on phones so the header fits next to "Masuk" */}
              <span className="hidden sm:inline">Mulai Belajar</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
