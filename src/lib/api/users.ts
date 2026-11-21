import { toUser, type ApiUser } from '@/lib/api/auth'
import { api } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import type { User, UserRoleInput } from '@/lib/api/types'

// Admin-only endpoints (the stored admin token is sent automatically).
// Users are never created here; they sign up through POST /auth/register.

/** GET /users, newest first. */
export async function listUsers(): Promise<User[]> {
  const users = await inIndonesian(api.get<ApiUser[]>('/users'))
  return users.map(toUser)
}

/**
 * PUT /users/:id. Only the role can change. Changing your own role fails with
 * a 422 on the `role` field.
 */
export async function updateUserRole(id: string, input: UserRoleInput): Promise<User> {
  const user = await inIndonesian(
    api.put<ApiUser>(`/users/${encodeURIComponent(id)}`, { role: input.role }),
  )
  return toUser(user)
}

/**
 * DELETE /users/:id. Also removes the user's tokens and favorite sentences.
 * Deleting your own account fails with a 403.
 */
export async function deleteUser(id: string): Promise<void> {
  await inIndonesian(api.delete(`/users/${encodeURIComponent(id)}`))
}

// --- Errors ---------------------------------------------------------------

/** Rejects with an Indonesian version of the API's (English) error. */
function inIndonesian<T>(request: Promise<T>): Promise<T> {
  return request.catch((error: unknown) => {
    throw translateError(error)
  })
}

function translateError(error: unknown): unknown {
  // Aborts and other non-API errors pass through; status 0 is already in Indonesian.
  if (!(error instanceof ApiError) || error.status === 0) return error

  const roleMessage = error.fieldErrors.role?.[0]
  if (roleMessage) {
    const message = /own role/i.test(roleMessage)
      ? 'Kamu tidak dapat mengubah role akun sendiri.'
      : 'Pilih role Admin atau User.'
    return new ApiError(message, { status: error.status, fieldErrors: { role: [message] } })
  }

  return new ApiError(translateMessage(error), { status: error.status })
}

function translateMessage({ status, message }: ApiError): string {
  switch (status) {
    case 401:
      return 'Sesi kamu telah berakhir. Silakan masuk lagi.'
    case 403:
      return /own account/i.test(message)
        ? 'Kamu tidak dapat menghapus akun sendiri.'
        : 'Hanya admin yang dapat mengelola users.'
    case 404:
      return 'User tidak ditemukan. Mungkin sudah dihapus.'
    case 429:
      return 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.'
    default:
      return status >= 500
        ? 'Terjadi kesalahan pada server. Coba lagi.'
        : 'Permintaan tidak dapat diproses. Coba lagi.'
  }
}
