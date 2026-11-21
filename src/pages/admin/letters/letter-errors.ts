import { ApiError } from '@/lib/api/errors'

export type LetterFieldErrors = { symbol?: string; image?: string }

const MAX_IMAGE_MB = 2
const IMAGE_TOO_LARGE = `Ukuran gambar maksimal ${MAX_IMAGE_MB} MB.`
const IMAGE_FORMATS = 'JPG, PNG, atau WebP'

/** Indonesian message for a failed letter request that isn't about one field. */
export function getLetterErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Terjadi kesalahan. Coba lagi.'
  switch (error.status) {
    case 0:
      return error.message // "server unreachable", already in Indonesian
    case 401:
      return 'Sesi kamu telah berakhir. Silakan masuk lagi.'
    case 403:
      return 'Hanya admin yang dapat melakukan tindakan ini.'
    case 404:
      return 'Letter tidak ditemukan. Mungkin sudah dihapus.'
    case 429:
      return 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.'
  }
  return error.status >= 500
    ? 'Terjadi kesalahan pada server. Coba lagi.'
    : 'Terjadi kesalahan. Coba lagi.'
}

type Translation = [RegExp, (match: RegExpMatchArray) => string]

function translate(message: string, translations: Translation[], fallback: string) {
  for (const [pattern, toIndonesian] of translations) {
    const match = message.match(pattern)
    if (match) return toIndonesian(match)
  }
  return fallback
}

/**
 * The API's validation errors (English) as Indonesian messages for the letter
 * form's fields; empty when the error isn't about a field. `symbol` is the
 * value that was sent, used for the "already exists" message.
 */
export function getLetterFieldErrors(error: unknown, symbol: string): LetterFieldErrors {
  if (!(error instanceof ApiError)) return {}
  // Upload bigger than the server accepts at all.
  if (error.status === 413) return { image: IMAGE_TOO_LARGE }

  const result: LetterFieldErrors = {}
  const symbolMessage = error.fieldErrors.symbol?.[0]
  const imageMessage = error.fieldErrors.image?.[0]

  if (symbolMessage) {
    result.symbol = translate(
      symbolMessage,
      [
        // The API compares the trimmed, uppercased symbol, so "a" collides with "A".
        [/already been taken/i, () => `"${symbol.trim().toUpperCase()}" sudah ada.`],
        [/required/i, () => 'Huruf, angka, atau simbol wajib diisi.'],
        [/greater than (\d+) characters/i, ([, max]) => `Maksimal ${max} karakter.`],
      ],
      'Huruf, angka, atau simbol tidak valid.',
    )
  }

  if (imageMessage) {
    result.image = translate(
      imageMessage,
      [
        [/required/i, () => 'Gambar isyarat wajib diunggah.'],
        [/greater than \d+ kilobytes|failed to upload/i, () => IMAGE_TOO_LARGE],
        [
          /must be an image|must be a file of type/i,
          () => `File harus berupa gambar ${IMAGE_FORMATS}.`,
        ],
      ],
      `Gambar tidak valid. Gunakan ${IMAGE_FORMATS} maksimal ${MAX_IMAGE_MB} MB.`,
    )
  }

  return result
}
