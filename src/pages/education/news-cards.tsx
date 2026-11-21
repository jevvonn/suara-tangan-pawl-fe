import { useId } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import { NewsThumbnail } from '@/components/news-thumbnail'
import { Skeleton } from '@/components/ui/skeleton'
import type { EducationNews } from '@/lib/api/types'
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { newsDetailPath } from '@/pages/education/news-utils'

// The whole card is the link; its accessible name is just the title (aria-labelledby).
const cardLinkClassName =
  'group flex h-full overflow-hidden rounded-[32px] bg-card p-2 shadow-[0_1px_1px_rgb(0_0_0/0.05)] transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0'

const thumbnailClassName =
  'transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100'

const metaClassName = 'text-xs font-bold tracking-[0.44px] text-muted-foreground'

type NewsTimeProps = {
  iso: string
  /** Adds the date: "10 jam lalu · 21 Nov 2026". */
  withDate?: boolean
  className?: string
}

/** "10 jam lalu", with the full date and time as a tooltip. Renders nothing for an invalid date. */
export function NewsTime({ iso, withDate, className }: NewsTimeProps) {
  const relative = formatRelativeTime(iso)
  if (!relative) return null

  return (
    <time dateTime={iso} title={formatDateTime(iso)} className={className}>
      {relative}
      {withDate && ` · ${formatDate(iso)}`}
    </time>
  )
}

/** Grid card: thumbnail, time, title and a clamped excerpt. */
export function NewsCard({ news }: { news: EducationNews }) {
  const titleId = useId()

  return (
    <Link
      to={newsDetailPath(news.id)}
      aria-labelledby={titleId}
      className={cn(cardLinkClassName, 'flex-col')}
    >
      <div className="aspect-video overflow-hidden rounded-[24px]">
        <NewsThumbnail src={news.thumbnailUrl} loading="lazy" className={thumbnailClassName} />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-4 pb-3">
        <NewsTime iso={news.createdAt} className={metaClassName} />
        <h2
          id={titleId}
          className="line-clamp-2 text-lg leading-6 font-bold wrap-anywhere text-foreground"
        >
          {news.title}
        </h2>
        <p className="line-clamp-3 text-sm wrap-anywhere text-muted-foreground">{news.content}</p>
      </div>
    </Link>
  )
}

/** The newest news item: a larger card, side by side from md up. */
export function FeaturedNewsCard({ news }: { news: EducationNews }) {
  const titleId = useId()

  return (
    <Link
      to={newsDetailPath(news.id)}
      aria-labelledby={titleId}
      className={cn(cardLinkClassName, 'flex-col md:flex-row')}
    >
      <div className="aspect-video shrink-0 overflow-hidden rounded-[24px] md:w-[55%]">
        <NewsThumbnail src={news.thumbnailUrl} className={thumbnailClassName} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 pt-4 pb-3 md:justify-center md:px-6 md:py-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded-full bg-tint-amber px-3 py-1 text-xs font-bold tracking-[0.44px] text-primary-foreground">
            Terbaru
          </span>
          <NewsTime iso={news.createdAt} className={metaClassName} />
        </p>
        <h2
          id={titleId}
          className="line-clamp-3 font-heading text-2xl leading-8 font-extrabold wrap-anywhere text-foreground sm:text-[28px] sm:leading-9"
        >
          {news.title}
        </h2>
        <p className="line-clamp-3 text-base wrap-anywhere text-muted-foreground md:line-clamp-4">
          {news.content}
        </p>
        <span
          aria-hidden
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-primary-foreground"
        >
          Baca selengkapnya
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  )
}

/** Small card for "Berita lainnya": a row on phones, a column from sm up. */
export function CompactNewsCard({ news }: { news: EducationNews }) {
  const titleId = useId()

  return (
    <Link
      to={newsDetailPath(news.id)}
      aria-labelledby={titleId}
      className={cn(cardLinkClassName, 'items-center gap-3 sm:flex-col sm:items-stretch sm:gap-0')}
    >
      <div className="aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-[24px] sm:aspect-video sm:w-full">
        <NewsThumbnail
          src={news.thumbnailUrl}
          compact
          loading="lazy"
          className={thumbnailClassName}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-1 pr-2 sm:px-3 sm:pt-3 sm:pb-2">
        <h3
          id={titleId}
          className="line-clamp-2 text-base leading-6 font-bold wrap-anywhere text-foreground"
        >
          {news.title}
        </h3>
        <NewsTime iso={news.createdAt} className={metaClassName} />
      </div>
    </Link>
  )
}

export function NewsCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-[32px] bg-card p-2',
        featured && 'md:flex-row',
      )}
    >
      <Skeleton className={cn('aspect-video rounded-[24px]', featured && 'md:w-[55%]')} />
      <div
        className={cn(
          'flex flex-1 flex-col gap-3 px-3 pt-4 pb-3',
          featured && 'md:justify-center md:px-6',
        )}
      >
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className={cn('h-5 w-4/5 rounded-full', featured && 'h-7')} />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>
    </div>
  )
}
