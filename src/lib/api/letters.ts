import { api } from '@/lib/api/client'
import type { Letter, LetterInput } from '@/lib/api/types'

export type LetterCategory = 'letter' | 'number' | 'symbol'

/** Same rule as the API's `category` column. */
export function getLetterCategory(symbol: string): LetterCategory {
  if (/^[A-Z]+$/i.test(symbol)) return 'letter'
  if (/^[0-9]+$/.test(symbol)) return 'number'
  return 'symbol'
}

/** A letter as the API sends it (snake_case, numeric id). */
export type ApiLetter = {
  id: number
  symbol: string
  category: LetterCategory
  /** Full URL, e.g. http://127.0.0.1:8000/storage/letters/abc.webp */
  image_url: string
  created_by: number | null
  created_at: string
  updated_at: string
}

/** The one place an API letter becomes the camelCase `Letter` the UI works with. */
export function toLetter(raw: ApiLetter): Letter {
  return {
    id: String(raw.id),
    symbol: raw.symbol,
    imageUrl: raw.image_url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

/** Multipart body; leaving out `image` on update keeps the current image. */
function toFormData(input: LetterInput) {
  const form = new FormData()
  form.append('symbol', input.symbol)
  if (input.image) form.append('image', input.image)
  return form
}

/** GET /letters, already sorted: letters, then numbers, then symbols ("2" before "10"). */
export async function listLetters(): Promise<Letter[]> {
  const letters = await api.get<ApiLetter[]>('/letters')
  return letters.map(toLetter)
}

/** POST /letters (admin). The API trims and uppercases the symbol. */
export async function createLetter(input: LetterInput): Promise<Letter> {
  return toLetter(await api.post<ApiLetter>('/letters', toFormData(input)))
}

/** PUT /letters/:id (admin). */
export async function updateLetter(id: string, input: LetterInput): Promise<Letter> {
  return toLetter(await api.put<ApiLetter>(`/letters/${id}`, toFormData(input)))
}

/** DELETE /letters/:id (admin). Also deletes the image on the server. */
export async function deleteLetter(id: string): Promise<void> {
  await api.delete(`/letters/${id}`)
}
