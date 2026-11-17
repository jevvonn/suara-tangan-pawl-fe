import handA from '@/assets/landing/hand-a.svg'
import handH from '@/assets/landing/hand-h.svg'
import handL from '@/assets/landing/hand-l.svg'
import handO from '@/assets/landing/hand-o.svg'

export type SignLetter = {
  letter: string
  description: string
  image?: string
}

const SIGN_LETTERS: Record<string, Omit<SignLetter, 'letter'>> = {
  H: { description: '2 Jari Mendatar', image: handH },
  A: { description: 'Kepalan Tegak', image: handA },
  L: { description: 'Sudut L', image: handL },
  O: { description: 'Lingkar Bulat', image: handO },
}

/** Splits text into the alphabet letters we can show as sign cards. */
export function toSignLetters(text: string): SignLetter[] {
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map((letter) => ({
      letter,
      ...(SIGN_LETTERS[letter] ?? { description: 'Segera hadir' }),
    }))
}
