export type Letter = {
  id: string
  /** The letter, number or symbol, e.g. "A", "7" or "?" */
  symbol: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export type LetterInput = {
  symbol: string
  /** Required on create; optional on update (keeps the current image). */
  image?: File
}

export type UserRole = 'admin' | 'user'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

/** Admins can only change a user's role; users sign up themselves. */
export type UserRoleInput = {
  role: UserRole
}

export type EducationNews = {
  id: string
  title: string
  content: string
  /** null means the UI shows the default thumbnail. */
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
}

export type EducationNewsInput = {
  title: string
  content: string
  /**
   * File to upload, `null` to remove the current thumbnail,
   * or `undefined` to leave it unchanged.
   */
  thumbnail?: File | null
}

export type DashboardStats = {
  letters: { total: number; letters: number; numbers: number; symbols: number }
  users: { total: number; admins: number; users: number }
  educationNews: { total: number; withThumbnail: number }
  recentLetters: Letter[]
  recentEducationNews: EducationNews[]
}
