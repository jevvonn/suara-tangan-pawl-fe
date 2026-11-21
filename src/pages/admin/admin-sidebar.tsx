import { Link, NavLink, matchPath, useLocation, useNavigate } from 'react-router'
import { ExternalLink, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { BrandMark } from '@/components/layout/brand-mark'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSession } from '@/hooks/use-session'
import { adminNav } from '@/pages/admin/admin-nav'

const menuButtonClassName =
  'h-10 gap-3 rounded-full px-4 text-[15px] font-bold tracking-[0.15px] text-muted-foreground hover:text-foreground data-active:bg-primary data-active:font-bold data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground data-active:active:bg-primary data-active:active:text-primary-foreground data-active:drop-shadow-[0_2px_0_var(--color-primary-foreground)] [&_svg]:size-[18px]'

export function AdminSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isMobile, setOpenMobile } = useSidebar()
  const { user, logout } = useSession()

  // Close the mobile sheet after navigating.
  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false)
  }

  async function handleLogout() {
    handleNavigate()
    // Leave the admin panel first, otherwise its guard would redirect to /login.
    await navigate('/', { replace: true })
    await logout()
    toast.success('Kamu telah keluar.')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-5 pb-3">
        <Link
          to="/admin"
          onClick={handleNavigate}
          className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary group-data-[collapsible=icon]:justify-center"
        >
          <BrandMark textClassName="tracking-[-0.5px] group-data-[collapsible=icon]:hidden" />
          <span className="rounded-full bg-tint-amber px-2 py-0.5 text-[10px] leading-4 font-bold tracking-[0.4px] text-primary-foreground group-data-[collapsible=icon]:hidden">
            ADMIN
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold tracking-[0.44px] text-muted-foreground/70 uppercase">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {adminNav.map((item) => {
                const isActive = Boolean(
                  matchPath({ path: item.to, end: item.end ?? false }, pathname),
                )
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={menuButtonClassName}
                    >
                      <NavLink to={item.to} end={item.end} onClick={handleNavigate}>
                        <item.icon aria-hidden />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {user && (
          <div className="flex min-w-0 flex-col px-4 pb-1 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        )}
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Lihat situs"
              className={menuButtonClassName}
            >
              <Link to="/" target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden />
                <span>Lihat situs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Keluar"
              onClick={handleLogout}
              className={menuButtonClassName}
            >
              <LogOut aria-hidden />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
