import { ApiError } from '@/lib/api/errors'
import { getLetterCategory, type LetterCategory } from '@/lib/api/letters'
import type { Letter } from '@/lib/api/types'
import type { SignCard } from '@/lib/sign-cards'

/** One dictionary entry: a sign card plus what the page needs to key and group it. */
export type KamusEntry = SignCard & { id: string; category: LetterCategory }

export type CategoryFilter = 'all' | LetterCategory

type SectionConfig = {
  category: LetterCategory
  title: string
  /** Decorative glyph in the heading's icon tile. */
  glyph: string
  tint: string
}

/** Section order on the page; matches the API order (letters, numbers, symbols). */
export const SECTIONS: SectionConfig[] = [
  { category: 'letter', title: 'Huruf', glyph: 'Aa', tint: 'bg-tint-amber' },
  { category: 'number', title: 'Angka', glyph: '12', tint: 'bg-tint-sky' },
  { category: 'symbol', title: 'Simbol', glyph: '?!', tint: 'bg-secondary' },
]

export type KamusSectionData = SectionConfig & { entries: KamusEntry[] }

export function toEntries(letters: Letter[]): KamusEntry[] {
  return letters.map((letter) => ({
    id: letter.id,
    symbol: letter.symbol,
    // An empty URL shows the dashed "no image yet" card instead of a broken image.
    image: letter.imageUrl || undefined,
    category: getLetterCategory(letter.symbol),
  }))
}

/** Search is by symbol: trimmed and uppercased, like the API stores symbols. */
export function normalizeQuery(query: string) {
  return query.trim().toUpperCase()
}

export function filterEntries(entries: KamusEntry[], query: string, category: CategoryFilter) {
  const needle = normalizeQuery(query)
  return entries.filter(
    (entry) =>
      (category === 'all' || entry.category === category) && entry.symbol.includes(needle),
  )
}

/**
 * Groups entries into the page's sections, keeping the API order inside each
 * one ("2" before "10"). Empty sections are left out.
 */
export function groupEntries(entries: KamusEntry[]): KamusSectionData[] {
  return SECTIONS.map((section) => ({
    ...section,
    entries: entries.filter((entry) => entry.category === section.category),
  })).filter((section) => section.entries.length > 0)
}

/** Indonesian message for a failed GET /letters (the API's own messages are English). */
export function getKamusErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message // server unreachable; already Indonesian
    if (error.status === 429) return 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.'
  }
  return 'Terjadi kesalahan pada server. Coba lagi.'
}
