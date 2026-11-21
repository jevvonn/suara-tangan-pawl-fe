import { api } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { toLetter, type ApiLetter } from '@/lib/api/letters'
import type { FavoriteSentence } from '@/lib/api/types'

// The logged-in user's own favorite sentences (any role; the stored token is sent).

type ApiFavoriteSentence = {
  id: number
  sentence: string
  letters: ApiLetter[]
  created_at: string
  updated_at: string
}

function toFavoriteSentence(raw: ApiFavoriteSentence): FavoriteSentence {
  return {
    id: String(raw.id),
    sentence: raw.sentence,
    letters: raw.letters.map(toLetter),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

/** GET /favorite-sentences, newest first, each with its letters. */
export async function listFavoriteSentences(): Promise<FavoriteSentence[]> {
  const favorites = await api.get<ApiFavoriteSentence[]>('/favorite-sentences')
  return favorites.map(toFavoriteSentence)
}

/**
 * POST /favorite-sentences. Saving a sentence that is already a favorite
 * (ignoring letter case and extra spaces) returns the existing one.
 */
export async function saveFavoriteSentence(sentence: string): Promise<FavoriteSentence> {
  return toFavoriteSentence(
    await api.post<ApiFavoriteSentence>('/favorite-sentences', { sentence }),
  )
}

/** DELETE /favorite-sentences/:id (only your own). */
export async function deleteFavoriteSentence(id: string): Promise<void> {
  await api.delete(`/favorite-sentences/${encodeURIComponent(id)}`)
}

/** Indonesian message for a failed favorites request (the API's messages are English). */
export function getFavoriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return error.message // server unreachable; already Indonesian
      case 401:
        return 'Sesi kamu telah berakhir. Silakan masuk lagi.'
      case 404:
        return 'Kalimat favorit tidak ditemukan. Mungkin sudah dihapus.'
      case 422:
        return 'Kalimat tidak valid. Maksimal 255 karakter.'
      case 429:
        return 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.'
    }
  }
  return 'Terjadi kesalahan. Coba lagi.'
}
