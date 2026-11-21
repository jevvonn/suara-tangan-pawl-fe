import { ApiError } from '@/lib/api/errors'
import { db, delay, now } from '@/lib/api/mock-db'
import type { User, UserRoleInput } from '@/lib/api/types'

// TODO(api): replace each function body with a call to the backend (admin token required):
//   GET    /api/users
//   PUT    /api/users/:id   (JSON: { role })
//   DELETE /api/users/:id
// Users are never created here; they sign up through POST /api/auth/register.

export async function listUsers(): Promise<User[]> {
  await delay()
  return structuredClone(db.users).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateUserRole(id: string, input: UserRoleInput): Promise<User> {
  await delay()
  const user = db.users.find((u) => u.id === id)
  if (!user) throw new ApiError('Data tidak ditemukan.', { status: 404 })

  Object.assign(user, { role: input.role, updatedAt: now() })
  return structuredClone(user)
}

export async function deleteUser(id: string): Promise<void> {
  await delay()
  const index = db.users.findIndex((u) => u.id === id)
  if (index === -1) throw new ApiError('Data tidak ditemukan.', { status: 404 })
  db.users.splice(index, 1)
}
