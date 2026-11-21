import { ApiError, getErrorMessage } from '@/lib/api/errors'

/** Form-level message for a failed login or register request. */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Email atau kata sandi salah.'
    if (error.status === 429) {
      return 'Terlalu banyak percobaan. Tunggu sekitar satu menit, lalu coba lagi.'
    }
  }
  return getErrorMessage(error)
}

// The API's validation messages are in English; translate the ones these forms can get.
const FIELD_MESSAGES: [RegExp, (match: RegExpMatchArray) => string][] = [
  [/already been taken/i, () => 'Email sudah terdaftar.'],
  [/valid email/i, () => 'Format email tidak valid.'],
  [/confirmation does not match/i, () => 'Konfirmasi kata sandi tidak sama.'],
  [/at least (\d+) characters/i, ([, min]) => `Kata sandi minimal ${min} karakter.`],
]

/** Indonesian version of an API field message, or the original when unknown. */
export function translateAuthFieldError(message: string): string {
  for (const [pattern, translate] of FIELD_MESSAGES) {
    const match = message.match(pattern)
    if (match) return translate(match)
  }
  return message
}
