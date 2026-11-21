import { api } from '@/lib/api/client'
import type { EducationNews, EducationNewsInput } from '@/lib/api/types'

/** Education news as the API sends it. */
export type ApiEducationNews = {
  id: number
  title: string
  content: string
  /** Full URL under /storage, or null for "use the default thumbnail". */
  thumbnail_url: string | null
  created_by: number | null
  created_at: string
  updated_at: string
}

export function toEducationNews(raw: ApiEducationNews): EducationNews {
  return {
    id: String(raw.id),
    title: raw.title,
    content: raw.content,
    thumbnailUrl: raw.thumbnail_url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

const newsPath = (id: string) => `/education-news/${encodeURIComponent(id)}`

/**
 * Multipart body for create and update. Thumbnail: a File uploads it, `null`
 * removes the current one (`remove_thumbnail=1`, only meaningful on update),
 * `undefined` keeps it.
 */
function toFormData(input: EducationNewsInput, { canRemoveThumbnail = false } = {}) {
  const form = new FormData()
  form.append('title', input.title.trim())
  form.append('content', input.content.trim())
  if (input.thumbnail) form.append('thumbnail', input.thumbnail)
  else if (input.thumbnail === null && canRemoveThumbnail) form.append('remove_thumbnail', '1')
  return form
}

/** GET /education-news, newest first. */
export async function listEducationNews(): Promise<EducationNews[]> {
  const list = await api.get<ApiEducationNews[]>('/education-news')
  return list.map(toEducationNews)
}

/** POST /education-news (multipart: title, content, thumbnail?) */
export async function createEducationNews(input: EducationNewsInput): Promise<EducationNews> {
  const news = await api.post<ApiEducationNews>('/education-news', toFormData(input))
  return toEducationNews(news)
}

/** PUT /education-news/:id (multipart: title, content, thumbnail? | remove_thumbnail?) */
export async function updateEducationNews(
  id: string,
  input: EducationNewsInput,
): Promise<EducationNews> {
  const news = await api.put<ApiEducationNews>(
    newsPath(id),
    toFormData(input, { canRemoveThumbnail: true }),
  )
  return toEducationNews(news)
}

/** DELETE /education-news/:id (the API also deletes the thumbnail file). */
export async function deleteEducationNews(id: string): Promise<void> {
  await api.delete(newsPath(id))
}
