import { api } from '@/lib/api/client'
import type { User, UserRole } from '@/lib/api/types'

// Plain API calls. Storing the token and the session lives in `@/hooks/use-session`.

/** A user as the API sends it (snake_case, numeric id). */
export type ApiUser = {
  id: number
  name: string
  email: string
  role: UserRole
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

/** The one place an API user becomes the camelCase `User` the UI works with. */
export function toUser(raw: ApiUser): User {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    role: raw.role,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

export type AuthResponse = {
  user: User
  token: string
}

type ApiAuthPayload = {
  user: ApiUser
  token: string
  token_type: 'Bearer'
}

function toAuthResponse(payload: ApiAuthPayload): AuthResponse {
  return { user: toUser(payload.user), token: payload.token }
}

/** POST /auth/login. Wrong credentials → ApiError with status 401. */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const payload = await api.post<ApiAuthPayload>(
    '/auth/login',
    { email: input.email, password: input.password },
    { token: null },
  )
  return toAuthResponse(payload)
}

/** POST /auth/register. New accounts always get the `user` role. */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const payload = await api.post<ApiAuthPayload>(
    '/auth/register',
    {
      name: input.name,
      email: input.email,
      password: input.password,
      password_confirmation: input.passwordConfirmation,
    },
    { token: null },
  )
  return toAuthResponse(payload)
}

/** GET /auth/session: the user the stored token belongs to. */
export async function getSession(signal?: AbortSignal): Promise<User> {
  const { user } = await api.get<{ user: ApiUser }>('/auth/session', { signal })
  return toUser(user)
}

/** POST /auth/logout: revokes `token` on the server. */
export async function logout(token: string): Promise<void> {
  await api.post('/auth/logout', undefined, { token })
}
