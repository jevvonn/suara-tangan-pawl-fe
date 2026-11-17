import { ApiError } from '@/lib/api/errors'
import { createId, db, delay, now } from '@/lib/api/mock-db'
import type { User, UserInput } from '@/lib/api/types'

// TODO(api): replace each function body with a call to the backend, e.g.
//   GET    /users
//   POST   /users
//   PUT    /users/:id
//   DELETE /users/:id

function normalize(input: UserInput): UserInput {
  return { name: input.name.trim(), email: input.email.trim().toLowerCase(), role: input.role }
}

function assertUniqueEmail(email: string, ignoreId?: string) {
  const taken = db.users.some((u) => u.email === email && u.id !== ignoreId)
  if (taken) {
    throw new ApiError('Email sudah digunakan.', { status: 409, field: 'email' })
  }
}

export async function listUsers(): Promise<User[]> {
  await delay()
  return structuredClone(db.users).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createUser(input: UserInput): Promise<User> {
  await delay()
  const data = normalize(input)
  assertUniqueEmail(data.email)

  const timestamp = now()
  const user: User = { id: createId('usr'), ...data, createdAt: timestamp, updatedAt: timestamp }
  db.users.push(user)
  return structuredClone(user)
}

export async function updateUser(id: string, input: UserInput): Promise<User> {
  await delay()
  const user = db.users.find((u) => u.id === id)
  if (!user) throw new ApiError('Data tidak ditemukan.', { status: 404 })

  const data = normalize(input)
  assertUniqueEmail(data.email, id)
  Object.assign(user, data, { updatedAt: now() })
  return structuredClone(user)
}

export async function deleteUser(id: string): Promise<void> {
  await delay()
  const index = db.users.findIndex((u) => u.id === id)
  if (index === -1) throw new ApiError('Data tidak ditemukan.', { status: 404 })
  db.users.splice(index, 1)
}
