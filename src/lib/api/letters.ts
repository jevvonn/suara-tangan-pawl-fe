import { ApiError } from '@/lib/api/errors'
import { createId, db, delay, now, releaseFile, uploadFile } from '@/lib/api/mock-db'
import type { Letter, LetterInput } from '@/lib/api/types'

// TODO(api): replace each function body with a call to the backend, e.g.
//   GET    /letters
//   POST   /letters        (multipart: symbol, image)
//   PUT    /letters/:id    (multipart: symbol, image?)
//   DELETE /letters/:id

export type LetterCategory = 'letter' | 'number' | 'symbol'

export function getLetterCategory(symbol: string): LetterCategory {
  if (/^[A-Z]+$/i.test(symbol)) return 'letter'
  if (/^[0-9]+$/.test(symbol)) return 'number'
  return 'symbol'
}

const CATEGORY_ORDER: Record<LetterCategory, number> = { letter: 0, number: 1, symbol: 2 }

export function compareLetters(a: Letter, b: Letter) {
  const byCategory =
    CATEGORY_ORDER[getLetterCategory(a.symbol)] - CATEGORY_ORDER[getLetterCategory(b.symbol)]
  return byCategory || a.symbol.localeCompare(b.symbol, 'id', { numeric: true })
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase()
}

function assertUniqueSymbol(symbol: string, ignoreId?: string) {
  const taken = db.letters.some((l) => l.symbol === symbol && l.id !== ignoreId)
  if (taken) {
    throw new ApiError(`"${symbol}" sudah ada.`, { status: 409, field: 'symbol' })
  }
}

export async function listLetters(): Promise<Letter[]> {
  await delay()
  return structuredClone(db.letters).sort(compareLetters)
}

export async function createLetter(input: LetterInput): Promise<Letter> {
  await delay()
  const symbol = normalizeSymbol(input.symbol)
  assertUniqueSymbol(symbol)
  if (!input.image) throw new ApiError('Gambar wajib diunggah.', { field: 'image' })

  const timestamp = now()
  const letter: Letter = {
    id: createId('ltr'),
    symbol,
    imageUrl: uploadFile(input.image),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  db.letters.push(letter)
  return structuredClone(letter)
}

export async function updateLetter(id: string, input: LetterInput): Promise<Letter> {
  await delay()
  const letter = db.letters.find((l) => l.id === id)
  if (!letter) throw new ApiError('Data tidak ditemukan.', { status: 404 })

  const symbol = normalizeSymbol(input.symbol)
  assertUniqueSymbol(symbol, id)

  letter.symbol = symbol
  if (input.image) {
    releaseFile(letter.imageUrl)
    letter.imageUrl = uploadFile(input.image)
  }
  letter.updatedAt = now()
  return structuredClone(letter)
}

export async function deleteLetter(id: string): Promise<void> {
  await delay()
  const index = db.letters.findIndex((l) => l.id === id)
  if (index === -1) throw new ApiError('Data tidak ditemukan.', { status: 404 })
  releaseFile(db.letters[index].imageUrl)
  db.letters.splice(index, 1)
}
