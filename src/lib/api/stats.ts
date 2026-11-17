import { getLetterCategory } from '@/lib/api/letters'
import { db, delay } from '@/lib/api/mock-db'
import type { DashboardStats } from '@/lib/api/types'

// TODO(api): replace with GET /dashboard/stats

const byNewest = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt)

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay()
  const categories = db.letters.map((l) => getLetterCategory(l.symbol))
  const count = (category: string) => categories.filter((c) => c === category).length
  const admins = db.users.filter((u) => u.role === 'admin').length

  return structuredClone({
    letters: {
      total: db.letters.length,
      letters: count('letter'),
      numbers: count('number'),
      symbols: count('symbol'),
    },
    users: { total: db.users.length, admins, users: db.users.length - admins },
    educationNews: {
      total: db.educationNews.length,
      withThumbnail: db.educationNews.filter((n) => n.thumbnailUrl).length,
    },
    recentLetters: [...db.letters].sort(byNewest).slice(0, 4),
    recentEducationNews: [...db.educationNews].sort(byNewest).slice(0, 3),
  })
}
