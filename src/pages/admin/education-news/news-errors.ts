import { ApiError } from '@/lib/api/errors'

export type NewsField = 'title' | 'content' | 'thumbnail'
export type NewsFieldErrors = Partial<Record<NewsField, string>>

const FIELD_LABELS: Record<NewsField, string> = {
  title: 'Judul',
  content: 'Konten',
  thumbnail: 'Thumbnail',
}

/** API field (snake_case) → form field. `remove_thumbnail` belongs to the thumbnail picker. */
const API_FIELDS: Partial<Record<string, NewsField>> = {
  title: 'title',
  content: 'content',
  thumbnail: 'thumbnail',
  remove_thumbnail: 'thumbnail',
}

const numberFormat = new Intl.NumberFormat('id-ID')

function formatKilobytes(kb: number) {
  return kb % 1024 === 0 ? `${kb / 1024} MB` : `${numberFormat.format(kb)} KB`
}

// The API's validation messages are Laravel's English defaults; translate the ones this form can get.
const MESSAGES: [RegExp, (label: string, match: RegExpMatchArray) => string][] = [
  [/is required/i, (label) => `${label} wajib diisi.`],
  [
    /greater than (\d+) kilobytes/i,
    (label, [, kb]) => `Ukuran ${label.toLowerCase()} maksimal ${formatKilobytes(Number(kb))}.`,
  ],
  [
    /greater than (\d+) characters/i,
    (label, [, max]) => `${label} maksimal ${numberFormat.format(Number(max))} karakter.`,
  ],
  [/must be an image|must be a file of type/i, (label) => `${label} harus berupa gambar JPG, PNG, atau WebP.`],
  [/failed to upload/i, (label) => `${label} gagal diunggah. Pastikan ukurannya maksimal 2 MB.`],
  [/prohibits/i, () => 'Pilih salah satu: ganti thumbnail atau hapus thumbnail.'],
  [/must be a string/i, (label) => `${label} harus berupa teks.`],
]

function translate(message: string, field: NewsField) {
  const label = FIELD_LABELS[field]
  for (const [pattern, format] of MESSAGES) {
    const match = message.match(pattern)
    if (match) return format(label, match)
  }
  return `${label} tidak valid.`
}

/** Indonesian messages for the fields of the news form that the API rejected. */
export function getNewsFieldErrors(error: unknown): NewsFieldErrors {
  if (!(error instanceof ApiError)) return {}

  const result: NewsFieldErrors = {}
  // The whole request was too big for the server; only the thumbnail can be that large.
  if (error.status === 413) result.thumbnail = 'Ukuran thumbnail maksimal 2 MB.'

  for (const [apiField, messages] of Object.entries(error.fieldErrors)) {
    const field = API_FIELDS[apiField]
    if (field && messages[0] && !result[field]) result[field] = translate(messages[0], field)
  }
  return result
}

/** Indonesian message for an error that doesn't belong to a form field, e.g. for a toast. */
export function getNewsErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') {
  if (!(error instanceof ApiError)) return fallback

  switch (error.status) {
    case 0:
      return error.message // "server unreachable", already in Indonesian
    case 401:
      return 'Sesi kamu telah berakhir. Silakan masuk lagi.'
    case 403:
      return 'Kamu tidak memiliki akses untuk mengelola berita.'
    case 404:
      return 'Berita tidak ditemukan. Mungkin sudah dihapus.'
    case 413:
      return 'Ukuran file terlalu besar. Maksimal 2 MB.'
    case 422:
      return 'Data berita belum valid. Periksa kembali isiannya.'
    case 429:
      return 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.'
  }
  if (error.status >= 500) return 'Terjadi kesalahan pada server. Coba lagi nanti.'
  return fallback
}
