import signA from '@/assets/signs/bisindo/a.webp'
import signH from '@/assets/signs/bisindo/h.webp'
import signL from '@/assets/signs/bisindo/l.webp'
import signO from '@/assets/signs/bisindo/o.webp'

export type SignLetter = {
  letter: string
  /** Photo of the BISINDO hand sign; undefined when not available yet. */
  image?: string
}

const BISINDO_LETTER_IMAGES: Partial<Record<string, string>> = {
  A: signA,
  H: signH,
  L: signL,
  O: signO,
}

/** Splits text into the alphabet letters we can show as sign cards. */
export function toSignLetters(text: string): SignLetter[] {
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map((letter) => ({ letter, image: BISINDO_LETTER_IMAGES[letter] }))
}
