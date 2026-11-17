import { ApiError } from '@/lib/api/errors'
import { createId, db, delay, now, releaseFile, uploadFile } from '@/lib/api/mock-db'
import type { EducationNews, EducationNewsInput } from '@/lib/api/types'

// TODO(api): replace each function body with a call to the backend, e.g.
//   GET    /education-news
//   POST   /education-news       (multipart: title, content, thumbnail?)
//   PUT    /education-news/:id   (multipart: title, content, thumbnail?, removeThumbnail?)
//   DELETE /education-news/:id

export async function listEducationNews(): Promise<EducationNews[]> {
  await delay()
  return structuredClone(db.educationNews).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function createEducationNews(input: EducationNewsInput): Promise<EducationNews> {
  await delay()
  const timestamp = now()
  const news: EducationNews = {
    id: createId('news'),
    title: input.title.trim(),
    content: input.content.trim(),
    thumbnailUrl: input.thumbnail ? uploadFile(input.thumbnail) : null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  db.educationNews.push(news)
  return structuredClone(news)
}

export async function updateEducationNews(
  id: string,
  input: EducationNewsInput,
): Promise<EducationNews> {
  await delay()
  const news = db.educationNews.find((n) => n.id === id)
  if (!news) throw new ApiError('Data tidak ditemukan.', { status: 404 })

  news.title = input.title.trim()
  news.content = input.content.trim()
  if (input.thumbnail !== undefined) {
    releaseFile(news.thumbnailUrl)
    news.thumbnailUrl = input.thumbnail ? uploadFile(input.thumbnail) : null
  }
  news.updatedAt = now()
  return structuredClone(news)
}

export async function deleteEducationNews(id: string): Promise<void> {
  await delay()
  const index = db.educationNews.findIndex((n) => n.id === id)
  if (index === -1) throw new ApiError('Data tidak ditemukan.', { status: 404 })
  releaseFile(db.educationNews[index].thumbnailUrl)
  db.educationNews.splice(index, 1)
}
