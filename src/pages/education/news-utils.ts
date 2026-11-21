import { ApiError } from '@/lib/api/errors'
import type { EducationNews } from '@/lib/api/types'

/** Public URL of a news item's detail page. */
export const newsDetailPath = (id: string) => `/edukasi/${encodeURIComponent(id)}`

export function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404
}

/** Indonesian message for a failed news request (the API's messages are English). */
export function getEducationNewsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message // server unreachable; already Indonesian
    if (error.status === 404) return 'Berita tidak ditemukan. Mungkin sudah dihapus.'
    if (error.status === 429) return 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.'
    if (error.status >= 500) return 'Terjadi kesalahan pada server. Coba lagi nanti.'
  }
  return 'Terjadi kesalahan. Coba lagi.'
}

/** Search terms of a query: lowercase words, so "Bahasa  isyarat" finds "isyarat ... bahasa". */
export function toSearchTerms(query: string) {
  return query.toLocaleLowerCase('id').split(/\s+/).filter(Boolean)
}

/** True when every term appears in the news title or content (ignoring case). */
export function matchesSearch(news: EducationNews, terms: string[]) {
  const haystack = `${news.title}\n${news.content}`.toLocaleLowerCase('id')
  return terms.every((term) => haystack.includes(term))
}

/**
 * Paragraphs of plain-text content: blank lines separate paragraphs, single line
 * breaks stay inside a paragraph (render it with `white-space: pre-line`).
 */
export function toParagraphs(content: string) {
  return content
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export type TextPart = { text: string; href?: string }

const URL_PATTERN = /https?:\/\/[^\s<>"]+/g
const TRAILING_PUNCTUATION = /[.,;:!?'"’”]$/

/** Drops sentence punctuation after a URL, and a ")" that closes text around it, not the URL. */
function trimUrl(url: string) {
  let end = url.length
  while (end > 0) {
    const last = url[end - 1]!
    const inside = url.slice(0, end)
    if (TRAILING_PUNCTUATION.test(last)) end--
    else if (last === ')' && inside.split('(').length < inside.split(')').length) end--
    else break
  }
  return url.slice(0, end)
}

/** Splits plain text into text and http(s) link parts, so URLs can be rendered as links. */
export function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = []
  let index = 0
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = trimUrl(match[0])
    if (!URL.canParse(url)) continue
    if (match.index > index) parts.push({ text: text.slice(index, match.index) })
    parts.push({ text: url, href: url })
    index = match.index + url.length
  }
  if (index < text.length) parts.push({ text: text.slice(index) })
  return parts
}
