import { Outlet, ScrollRestoration, useMatches } from 'react-router'

import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { AdminSidebar } from '@/pages/admin/admin-sidebar'

export type AdminRouteHandle = { title: string }

function useAdminTitle() {
  const matches = useMatches()
  const handle = [...matches].reverse().find((m) => (m.handle as AdminRouteHandle)?.title)
    ?.handle as AdminRouteHandle | undefined
  return handle?.title ?? 'Dashboard'
}

export function AdminLayout() {
  const title = useAdminTitle()

  return (
    <SidebarProvider>
      <title>{`${title} · Admin Suara Tangan`}</title>
      <AdminSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 bg-background/90 px-4 shadow-[0_4px_20px_0_rgb(41_37_36/0.06)] backdrop-blur-[24px] md:px-8">
          <SidebarTrigger className="size-9 rounded-full hover:bg-muted" />
          <Separator orientation="vertical" className="h-5! self-center" />
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span aria-hidden className="text-muted-foreground/50">
              /
            </span>
            <span aria-current="page" className="font-bold text-foreground">
              {title}
            </span>
          </nav>
        </header>
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <Toaster position="top-right" />
      <ScrollRestoration />
    </SidebarProvider>
  )
}
