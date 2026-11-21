import { getLetterCategory, type LetterCategory } from '@/lib/api/letters'
import type { Letter } from '@/lib/api/types'

/** `/?kalimat=...` opens the landing page translator with that sentence. */
export const SENTENCE_PARAM = 'kalimat'

const CATEGORY_LABEL: Record<LetterCategory, string> = {
  letter: 'Huruf',
  number: 'Angka',
  symbol: 'Simbol',
}

/** "Huruf A", "Angka 10", "Simbol ?" */
export function describeSymbol(symbol: string) {
  return `${CATEGORY_LABEL[getLetterCategory(symbol)]} ${symbol}`
}

export type SignCard = {
  /** What the card shows, e.g. "A", "7", "10" or "?". */
  symbol: string
  /** Hand-sign photo from the API; undefined means "no image yet" (empty card). */
  image?: string
}

/** Same limit as the API's `letters.symbol` column. */
const MAX_SYMBOL_LENGTH = 3

/**
 * Turns text into sign cards using the letters the API found for it.
 *
 * Mirrors the API's SignTranslator: every non-space character becomes a card
 * (uppercased), except that a whole number of 2-3 digits becomes one card when
 * there is a letter for it (e.g. "10"); otherwise it is shown digit by digit.
 */
export function toSignCards(text: string, letters: Letter[]): SignCard[] {
  const images = new Map(letters.map((letter) => [letter.symbol, letter.imageUrl]))
  const cards: SignCard[] = []
  const add = (symbol: string) => cards.push({ symbol, image: images.get(symbol) })

  for (const [token] of text.toUpperCase().matchAll(/\d+|\S/gu)) {
    const isNumber = token.length > 1 && /^\d+$/.test(token)
    if (isNumber && !(token.length <= MAX_SYMBOL_LENGTH && images.has(token))) {
      for (const digit of token) add(digit)
    } else {
      add(token)
    }
  }
  return cards
}

/** Trims and collapses spaces, as the API does before saving a favorite. */
export function normalizeSentence(text: string) {
  return text.trim().replace(/\s+/g, ' ')
}

/** Whether two sentences are the same favorite (the API ignores letter case). */
export function isSameSentence(a: string, b: string) {
  return normalizeSentence(a).toLowerCase() === normalizeSentence(b).toLowerCase()
}
