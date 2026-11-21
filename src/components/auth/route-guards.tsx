import { Navigate, Outlet, useLocation } from 'react-router'

import { PageSpinner } from '@/components/page-spinner'
import { getHomePath, useSession } from '@/hooks/use-session'
import type { User } from '@/lib/api/types'

/** Location state the guards pass to /login, so admins return to the page they asked for. */
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

function getRedirectPath(user: User, state: unknown) {
  const from = (state as LoginState | null)?.from
  if (user.role === 'admin' && from && /^\/admin(?:[/?#]|$)/.test(from)) return from
  return getHomePath(user.role)
}

/**
 * For /login and /register: logged-in users are sent where their role belongs.
 * This also performs the redirect right after a successful login or register.
 */
export function GuestOnly() {
  const { user, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (user) return <Navigate to={getRedirectPath(user, location.state)} replace />
  return <Outlet />
}
