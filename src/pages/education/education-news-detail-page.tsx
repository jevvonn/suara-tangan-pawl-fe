import { useId, useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft, SearchX } from 'lucide-react'

import { NewsThumbnail } from '@/components/news-thumbnail'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEducationNews, useEducationNewsItem } from '@/lib/api/queries'
import type { EducationNews } from '@/lib/api/types'
import { CompactNewsCard, NewsTime } from '@/pages/education/news-cards'
import { NewsContent } from '@/pages/education/news-content'
import { getEducationNewsErrorMessage, isNotFoundError } from '@/pages/education/news-utils'

const LIST_PATH = '/edukasi'
const OTHER_NEWS_COUNT = 3

const pillButtonClassName =
  'h-9 gap-1.5 rounded-full border-0 px-4 text-[13px] leading-[18px] font-bold tracking-[0.26px]'

const articleClassName =
  'flex flex-col overflow-hidden rounded-[32px] bg-card p-2 shadow-[0_1px_1px_rgb(0_0_0/0.05)] sm:rounded-[48px] sm:p-3'
const articleImageClassName = 'aspect-video overflow-hidden rounded-[24px] sm:rounded-[40px]'
const articleBodyClassName = 'flex flex-col gap-4 px-3 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-10'

/** /edukasi/:id: one education news item, followed by a few other recent ones. */
export function EducationNewsDetailPage() {
  const { id = '' } = useParams()
  const { data: news, isError, error, refetch } = useEducationNewsItem(id)

  // A 404 wins over cached data (the news was deleted); for other errors keep showing
  // what we already have.
  let content
  if (isError && (isNotFoundError(error) || !news)) {
    content = isNotFoundError(error) ? (
      <NewsNotFound />
    ) : (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-[32px] bg-card p-6">
        <title>Edukasi · Suara Tangan</title>
        <h1 className="text-lg font-bold text-foreground">Gagal memuat berita</h1>
        <p className="text-sm text-destructive">{getEducationNewsErrorMessage(error)}</p>
        <Button variant="secondary" className={pillButtonClassName} onClick={() => refetch()}>
          Coba lagi
        </Button>
      </div>
    )
  } else if (news) {
    content = (
      <>
        <NewsArticle news={news} />
        <OtherNews currentId={news.id} />
      </>
    )
  } else {
    content = <NewsArticleSkeleton />
  }

  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-[880px] flex-col gap-6 sm:px-8">
        <BackButton />
        {content}
      </div>
    </section>
  )
}

/**
 * Back to where the user came from (usually the list, with its search and scroll
 * position). Opened directly (no in-app history), it goes to the list instead.
 * It's a real link to the list, so opening it in a new tab still works.
 */
function BackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const hasHistory = location.key !== 'default'

  return (
    <Button
      asChild
      variant="ghost"
      className="h-10 gap-2 self-start rounded-full bg-card px-4 text-[15px] leading-5 font-bold tracking-[0.15px] text-foreground shadow-[0_1px_1px_rgb(0_0_0/0.05)] hover:bg-secondary"
    >
      <Link
        to={LIST_PATH}
        onClick={(event) => {
          const opensElsewhere =
            event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
          if (!hasHistory || opensElsewhere) return
          event.preventDefault()
          void navigate(-1)
        }}
      >
        <ArrowLeft aria-hidden className="size-[18px]" />
        Kembali
      </Link>
    </Button>
  )
}

function NewsArticle({ news }: { news: EducationNews }) {
  return (
    <article className={articleClassName}>
      <title>{`${news.title} · Suara Tangan`}</title>
      <div className={articleImageClassName}>
        <NewsThumbnail src={news.thumbnailUrl} />
      </div>
      <div className={articleBodyClassName}>
        <h1 className="font-heading text-[28px] leading-9 font-extrabold wrap-anywhere text-foreground sm:text-[40px] sm:leading-[48px]">
          {news.title}
        </h1>
        <p className="text-sm font-bold tracking-[0.28px] text-muted-foreground">
          <NewsTime iso={news.createdAt} withDate />
        </p>
        <NewsContent
          content={news.content}
          className="mt-2 text-base leading-7 text-foreground sm:text-lg sm:leading-8"
        />
      </div>
    </article>
  )
}

function NewsArticleSkeleton() {
  return (
    <div role="status" className={articleClassName}>
      <title>Edukasi · Suara Tangan</title>
      <span className="sr-only">Memuat berita…</span>
      <Skeleton className={articleImageClassName} />
      <div className={articleBodyClassName}>
        <Skeleton className="h-8 w-4/5 rounded-full sm:h-10" />
        <Skeleton className="h-4 w-44 rounded-full" />
        <div className="mt-2 flex flex-col gap-3">
          {['w-full', 'w-full', 'w-11/12', 'w-full', 'w-3/5'].map((width, i) => (
            <Skeleton key={i} className={`h-4 rounded-full ${width}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NewsNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[32px] bg-card px-6 py-12 text-center">
      <title>Berita tidak ditemukan · Suara Tangan</title>
      <span className="flex size-14 items-center justify-center rounded-[16px] bg-tint-amber text-primary-foreground">
        <SearchX aria-hidden className="size-6" />
      </span>
      <h1 className="font-heading text-2xl leading-8 font-extrabold text-foreground">
        Berita tidak ditemukan
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Berita ini mungkin sudah dihapus atau tautannya salah.
      </p>
      <Button asChild className={`${pillButtonClassName} mt-2`}>
        <Link to={LIST_PATH}>Lihat semua berita</Link>
      </Button>
    </div>
  )
}

/** A few other recent news items; nothing while the list loads or if it fails. */
function OtherNews({ currentId }: { currentId: string }) {
  const headingId = useId()
  const { data: newsList } = useEducationNews()
  const others = useMemo(
    () => (newsList ?? []).filter((news) => news.id !== currentId).slice(0, OTHER_NEWS_COUNT),
    [newsList, currentId],
  )

  if (others.length === 0) return null

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <h2
          id={headingId}
          className="font-heading text-2xl leading-8 font-extrabold text-foreground"
        >
          Berita lainnya
        </h2>
        <Link
          to={LIST_PATH}
          className="rounded-full text-sm font-bold text-primary-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Lihat semua
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {others.map((news) => (
          <li key={news.id}>
            <CompactNewsCard news={news} />
          </li>
        ))}
      </ul>
    </section>
  )
}
