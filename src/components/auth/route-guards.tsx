import { Navigate, Outlet, useLocation } from 'react-router'

import { PageSpinner } from '@/components/page-spinner'
import { getHomePath, useSession } from '@/hooks/use-session'
import type { User } from '@/lib/api/types'

/** Location state passed to /login, so people return to the page they asked for. */
type LoginState = { from?: string }

/**
 * Only admins get through. Logged-out visitors go to /login and users go to
 * the landing page; nothing is rendered until the session is known.
 */
export function RequireAdmin() {
  const { user, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <PageSpinner fullScreen />
  if (!user) {
    const state: LoginState = { from: location.pathname + location.search + location.hash }
    return <Navigate to="/login" replace state={state} />
  }
  if (user.role !== 'admin') return <Navigate to={getHomePath(user.role)} replace />
  return <Outlet />
}

/**
 * Any logged-in user (admin or user). Logged-out visitors go to /login and
 * come back here afterwards.
 */
export function RequireAuth() {
  const { user, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (!user) {
    const state: LoginState = { from: location.pathname + location.search + location.hash }
    return <Navigate to="/login" replace state={state} />
  }
  return <Outlet />
}

const isAdminPath = (path: string) => /^\/admin(?:[/?#]|$)/.test(path)

function getRedirectPath(user: User, state: unknown) {
  const from = (state as LoginState | null)?.from
  // Only same-site paths ("/x", not "//evil.example"), and /admin only for admins.
  if (from && from.startsWith('/') && !from.startsWith('//')) {
    if (!isAdminPath(from) || user.role === 'admin') return from
  }
  return getHomePath(user.role)
}

/**
 * For /login and /register: logged-in users go back to the page they came from
 * (e.g. /favorit), otherwise where their role belongs. This also performs the
 * redirect right after a successful login or register.
 */
export function GuestOnly() {
  const { user, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (user) return <Navigate to={getRedirectPath(user, location.state)} replace />
  return <Outlet />
}
