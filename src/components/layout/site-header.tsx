import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { LayoutDashboard, LogOut, Menu } from 'lucide-react'
import { toast } from 'sonner'

import { BrandMark } from '@/components/layout/brand-mark'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSession } from '@/hooks/use-session'
import { mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import playCircleIcon from '@/assets/landing/icon-play-circle.svg'

const pillClassName =
  'h-10 rounded-full bg-surface-low px-5 text-[15px] leading-5 font-bold tracking-[0.15px] text-foreground hover:bg-secondary hover:text-foreground'

// Icon-only on phones and next to the desktop nav (lg), where space is tight.
const iconPillClassName = cn(pillClassName, 'gap-2 px-3.5 sm:px-5 lg:px-3.5 xl:px-5')
const iconPillLabelClassName = 'hidden sm:inline lg:hidden xl:inline'

/** "Masuk" when logged out; "Dashboard" (admins) and "Keluar" when logged in. */
function AccountActions() {
  const { user, isLoading, logout } = useSession()

  // Render nothing while the stored token is checked, so "Masuk" doesn't flash.
  if (isLoading) return null

  if (!user) {
    return (
      <Button asChild variant="ghost" className={pillClassName}>
        <NavLink to="/login">Masuk</NavLink>
      </Button>
    )
  }

  async function handleLogout() {
    await logout()
    toast.success('Kamu telah keluar.')
  }

  return (
    <>
      {user.role === 'admin' && (
        <Button asChild variant="ghost" className={iconPillClassName}>
          <Link to="/admin" aria-label="Dashboard admin" title="Dashboard admin">
            <LayoutDashboard aria-hidden className="size-[18px]" />
            <span className={iconPillLabelClassName}>Dashboard</span>
          </Link>
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={handleLogout}
        aria-label="Keluar"
        title={`Keluar dari akun ${user.name}`}
        className={iconPillClassName}
      >
        <LogOut aria-hidden className="size-[18px]" />
        <span className={iconPillLabelClassName}>Keluar</span>
      </Button>
    </>
  )
}

/** Below `lg` the nav pills don't fit, so the same links live in a slide-in menu. */
function MobileNav() {
  // Controlled, so a link can close the menu. (SheetClose asChild would turn NavLink's
  // className function into a string and lose the active styling.)
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Buka menu"
          title="Menu"
          className={cn(pillClassName, 'px-3 lg:hidden')}
        >
          <Menu aria-hidden className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" aria-describedby={undefined} className="w-72 bg-background p-4">
        <SheetHeader className="p-0 pr-10">
          <SheetTitle className="font-heading text-xl font-extrabold text-foreground">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Navigasi utama (seluler)">
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex rounded-full px-4 py-3 text-base leading-6 font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

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
          <AccountActions />
          {/* Hidden on phones to make room for the menu button, which also links to Kamus. */}
          <Button
            asChild
            className="hidden h-auto gap-2 rounded-full border-0 px-5 py-2.5 text-[15px] leading-5 font-bold tracking-[0.15px] drop-shadow-[0_4px_0_var(--color-primary-foreground)] hover:bg-primary/90 sm:inline-flex"
          >
            <Link to="/kamus">
              <img src={playCircleIcon} alt="" />
              Mulai Belajar
            </Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
