import { ApiError } from '@/lib/api/errors'
import { createId, db, delay, now } from '@/lib/api/mock-db'
import type { User } from '@/lib/api/types'

// TODO(api): replace each function body with a call to the backend, e.g.
//   POST /api/auth/login     (JSON: { email, password })                       → { user, token }
//   POST /api/auth/register  (JSON: { name, email, password, password_confirmation }) → { user, token }
// Then store the token (and send it as `Authorization: Bearer <token>`).

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

/**
 * Dummy passwords keyed by email. The seeded accounts all use "password123",
 * e.g. admin@example.com / password123.
 */
const passwords = new Map<string, string>(db.users.map((u) => [u.email, 'password123']))

function fakeToken() {
  return `mock_${crypto.randomUUID()}`
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  await delay(600)
  const email = input.email.trim().toLowerCase()
  const user = db.users.find((u) => u.email === email)

  if (!user || passwords.get(email) !== input.password) {
    // Same message for both cases so the form doesn't reveal which emails exist.
    throw new ApiError('Email atau kata sandi salah.', { status: 401 })
  }
  return { user: structuredClone(user), token: fakeToken() }
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  await delay(600)
  const email = input.email.trim().toLowerCase()

  if (db.users.some((u) => u.email === email)) {
    throw new ApiError('Email sudah terdaftar.', { status: 422, field: 'email' })
  }

  const timestamp = now()
  const user: User = {
    id: createId('usr'),
    name: input.name.trim(),
    email,
    role: 'user',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  db.users.push(user)
  passwords.set(email, input.password)
  return { user: structuredClone(user), token: fakeToken() }
}
