import { Hand, LayoutDashboard, Newspaper, Users, type LucideIcon } from 'lucide-react'

export type AdminNavItem = {
  label: string
  to: string
  icon: LucideIcon
  /** Only match the exact path (for the dashboard index route). */
  end?: boolean
}

export const adminNav: AdminNavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Letters', to: '/admin/letters', icon: Hand },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Education News', to: '/admin/education-news', icon: Newspaper },
]
