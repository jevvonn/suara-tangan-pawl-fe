import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Play, RotateCcw, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SENTENCE_PARAM } from '@/lib/sign-cards'
import { cn } from '@/lib/utils'
import {
  pillButtonClassName,
  sectionCardClassName,
  signGridClassName,
} from '@/pages/kamus/kamus-styles'
import bookIcon from '@/assets/landing/icon-book.svg'

export function KamusSkeleton() {
  return (
    // Same layout as the loaded page: toolbar, summary row, then a section.
    <div aria-busy="true" className="flex flex-col gap-6">
      <span role="status" className="sr-only">
        Memuat kamus…
      </span>
      <Skeleton className="h-11 rounded-full bg-card" />
      <div className="-mt-2 flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-24 rounded-full bg-card" />
        <Skeleton className="h-9 w-24 rounded-full bg-card" />
      </div>
      <div className={sectionCardClassName}>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-[12px] bg-muted" />
          <Skeleton className="h-7 w-28 rounded-full bg-muted" />
        </div>
        <ul aria-label="Memuat isyarat" className={signGridClassName}>
          {Array.from({ length: 10 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-square w-full rounded-[16px] bg-card" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

type StateCardProps = {
  icon: ReactNode
  iconClassName: string
  title: string
  description: ReactNode
  children?: ReactNode
}

function StateCard({ icon, iconClassName, title, description, children }: StateCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[32px] bg-card px-6 py-12 text-center drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-[16px] text-primary-foreground',
          iconClassName,
        )}
      >
        {icon}
      </span>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm break-words text-muted-foreground">{description}</p>
      {children && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{children}</div>
      )}
    </div>
  )
}

export function KamusEmpty() {
  return (
    <StateCard
      icon={<img src={bookIcon} alt="" />}
      iconClassName="bg-tint-sky"
      title="Belum ada huruf di kamus"
      description="Isyarat huruf, angka, dan simbol akan tampil di sini setelah ditambahkan."
    >
      <Button asChild className={pillButtonClassName}>
        <Link to="/">Ke Penerjemah</Link>
      </Button>
    </StateCard>
  )
}

type KamusNoResultsProps = {
  /** Normalized search text (may be empty when only a category filter is active). */
  query: string
  categoryLabel?: string
  onReset: () => void
}

export function KamusNoResults({ query, categoryLabel, onReset }: KamusNoResultsProps) {
  const where = categoryLabel ? ` di kategori ${categoryLabel}` : ''
  return (
    <StateCard
      icon={<SearchX aria-hidden className="size-6" />}
      iconClassName="bg-tint-amber"
      title="Isyarat tidak ditemukan"
      description={
        query ? (
          <>
            Tidak ada isyarat untuk “<span className="font-bold text-foreground">{query}</span>”
            {where}.
          </>
        ) : (
          `Tidak ada isyarat${where}.`
        )
      }
    >
      <Button variant="secondary" className={pillButtonClassName} onClick={onReset}>
        <RotateCcw aria-hidden />
        Hapus pencarian
      </Button>
      {/* A whole word isn't one symbol: offer to spell it out in the translator instead. */}
      {query.length > 1 && (
        <Button asChild className={pillButtonClassName}>
          <Link to={`/?${SENTENCE_PARAM}=${encodeURIComponent(query)}`}>
            <Play aria-hidden />
            Peragakan di Penerjemah
          </Link>
        </Button>
      )}
    </StateCard>
  )
}

type KamusErrorProps = {
  message: string
  /** Retrying shows the loading skeleton again (the query has no data to keep). */
  onRetry: () => void
}

export function KamusError({ message, onRetry }: KamusErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-[32px] bg-card p-6">
      <p className="text-sm text-destructive">Gagal memuat kamus: {message}</p>
      <Button variant="secondary" className={pillButtonClassName} onClick={onRetry}>
        <RotateCcw aria-hidden />
        Coba lagi
      </Button>
    </div>
  )
}
