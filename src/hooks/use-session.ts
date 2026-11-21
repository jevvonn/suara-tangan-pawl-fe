import { useCallback, useSyncExternalStore } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getSession,
  login,
  logout as revokeToken,
  register,
  type AuthResponse,
} from '@/lib/api/auth'
import { clearToken, getToken, setToken, subscribeToToken } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { queryKeys } from '@/lib/api/queries'
import type { User, UserRole } from '@/lib/api/types'

/** Where a user belongs after logging in: admins on the dashboard, users on the landing page. */
export function getHomePath(role: UserRole) {
  return role === 'admin' ? '/admin' : '/'
}

export type Session = {
  /** The logged-in user, or null when logged out (or while loading). */
  user: User | null
  isAdmin: boolean
  /** True while a stored token is being checked: show a spinner, not the page. */
  isLoading: boolean
  /** Revokes the token on the server, then clears it and the query cache. */
  logout: () => Promise<void>
}

export function useSession(): Session {
  const token = useSyncExternalStore(subscribeToToken, getToken)
  const logout = useLogout()
  const { data, isPending } = useQuery({
    // Keyed by token so a cached user never outlives the token it belongs to.
    queryKey: [...queryKeys.session, token],
    // No abort signal: a remount (e.g. StrictMode) then reuses the request in flight.
    queryFn: () => getSession(),
    enabled: token !== null,
    staleTime: 5 * 60_000,
    // Retry only when the server was unreachable or failed. A 401 clears the token instead.
    retry: (failureCount, error) =>
      failureCount < 2 &&
      error instanceof ApiError &&
      (error.status === 0 || error.status >= 500),
  })

  const user = token ? (data ?? null) : null
  return {
    user,
    isAdmin: user?.role === 'admin',
    isLoading: token !== null && isPending,
    logout,
  }
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useCallback(async () => {
    const token = getToken()
    if (token) {
      try {
        await revokeToken(token)
      } catch {
        // Already invalid or the server is unreachable: log out locally anyway.
      }
    }
    clearToken()
    queryClient.clear()
  }, [queryClient])
}

/** Stores a fresh login so the session is ready without another request. */
function useStartSession() {
  const queryClient = useQueryClient()
  return useCallback(
    ({ user, token }: AuthResponse) => {
      // Nothing cached by a previous session carries over. (Not clear(): that would
      // also drop the login/register mutation that is still settling.)
      queryClient.removeQueries()
      queryClient.setQueryData([...queryKeys.session, token], user)
      setToken(token)
    },
    [queryClient],
  )
}

/** Logs in. Route guards then send the user to `getHomePath(user.role)`. */
export function useLogin() {
  const startSession = useStartSession()
  return useMutation({ mutationFn: login, onSuccess: (response) => startSession(response) })
}

/** Creates an account and logs it in (always the `user` role). */
export function useRegister() {
  const startSession = useStartSession()
  return useMutation({ mutationFn: register, onSuccess: (response) => startSession(response) })
}
