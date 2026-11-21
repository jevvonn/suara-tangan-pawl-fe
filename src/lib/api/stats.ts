import { api } from '@/lib/api/client'
import { toEducationNews, type ApiEducationNews } from '@/lib/api/education-news'
import { toLetter, type ApiLetter } from '@/lib/api/letters'
import type { DashboardStats } from '@/lib/api/types'

/** GET /dashboard/stats as the API sends it (snake_case). Admin only. */
type ApiDashboardStats = {
  letters: { total: number; letters: number; numbers: number; symbols: number }
  users: { total: number; admins: number; users: number }
  education_news: { total: number; with_thumbnail: number }
  recent_letters: ApiLetter[]
  recent_education_news: ApiEducationNews[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const stats = await api.get<ApiDashboardStats>('/dashboard/stats')

  return {
    letters: stats.letters,
    users: stats.users,
    educationNews: {
      total: stats.education_news.total,
      withThumbnail: stats.education_news.with_thumbnail,
    },
    recentLetters: stats.recent_letters.map(toLetter),
    recentEducationNews: stats.recent_education_news.map(toEducationNews),
  }
}
