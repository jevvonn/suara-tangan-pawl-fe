import { useMemo, useRef, useState, type Ref } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Newspaper, Search, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEducationNews } from '@/lib/api/queries'
import type { EducationNews } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { FeaturedNewsCard, NewsCard, NewsCardSkeleton } from '@/pages/education/news-cards'
import {
  getEducationNewsErrorMessage,
  matchesSearch,
  toSearchTerms,
} from '@/pages/education/news-utils'

const SEARCH_PARAM = 'q'

const pillButtonClassName =
  'h-9 gap-1.5 rounded-full border-0 px-4 text-[13px] leading-[18px] font-bold tracking-[0.26px]'

const gridClassName = 'grid gap-4 sm:grid-cols-2'

/** /edukasi: public education news, newest first, with a search over title and content. */
export function EducationNewsPage() {
  const { data: newsList, isPending, isError, error, refetch } = useEducationNews()
  const [searchParams, setSearchParams] = useSearchParams()
  // The input is driven by local state (URL updates land a tick later and would move
  // the caret); the URL keeps the search when the user comes back from a news item.
  const [search, setSearch] = useState(() => searchParams.get(SEARCH_PARAM) ?? '')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const terms = useMemo(() => toSearchTerms(search), [search])

  function handleSearchChange(value: string) {
    setSearch(value)
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params)
        if (value.trim()) next.set(SEARCH_PARAM, value)
        else next.delete(SEARCH_PARAM)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const showSearch = !isError && (isPending || newsList.length > 0)

  return (
    <section className="px-4 py-10 sm:px-6">
      <title>Edukasi · Suara Tangan</title>
      <div className="mx-auto flex max-w-[880px] flex-col gap-6 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[32px] leading-[40px] font-extrabold text-foreground sm:text-[40px] sm:leading-[48px]">
              Edukasi
            </h1>
            <p className="text-lg font-medium text-balance text-muted-foreground">
              Berita dan materi seputar bahasa isyarat dan budaya Tuli.
            </p>
          </div>
          {showSearch && (
            <NewsSearch inputRef={searchInputRef} value={search} onChange={handleSearchChange} />
          )}
        </div>

        {isError ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-[32px] bg-card p-6">
            <p className="text-sm text-destructive">
              Gagal memuat berita: {getEducationNewsErrorMessage(error)}
            </p>
            <Button variant="secondary" className={pillButtonClassName} onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : isPending ? (
          <ul aria-label="Memuat berita" aria-busy className={gridClassName}>
            <li className="sm:col-span-2">
              <NewsCardSkeleton featured />
            </li>
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <NewsCardSkeleton />
              </li>
            ))}
          </ul>
        ) : newsList.length === 0 ? (
          <EmptyNews />
        ) : (
          <NewsResults
            newsList={newsList}
            terms={terms}
            query={search.trim()}
            onClearSearch={() => {
              handleSearchChange('')
              searchInputRef.current?.focus()
            }}
          />
        )}
      </div>
    </section>
  )
}

type NewsSearchProps = {
  value: string
  onChange: (value: string) => void
  inputRef: Ref<HTMLInputElement>
}

function NewsSearch({ value, onChange, inputRef }: NewsSearchProps) {
  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="relative w-full shrink-0 md:max-w-xs"
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        type="search"
        aria-label="Cari berita"
        placeholder="Cari judul atau isi berita…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-full border-0 bg-card pr-4 pl-10 shadow-[0_1px_1px_rgb(0_0_0/0.05)] focus-visible:ring-primary/50"
      />
    </form>
  )
}

type NewsResultsProps = {
  newsList: EducationNews[]
  terms: string[]
  query: string
  onClearSearch: () => void
}

/** All news with the newest one featured, or the search results as a plain grid. */
function NewsResults({ newsList, terms, query, onClearSearch }: NewsResultsProps) {
  const isSearching = terms.length > 0
  const results = useMemo(
    () => (isSearching ? newsList.filter((news) => matchesSearch(news, terms)) : newsList),
    [isSearching, newsList, terms],
  )

  return (
    <>
      {/* Always rendered so screen readers announce the count while typing; visually
          hidden (and out of the layout) without a search. */}
      <p role="status" className={cn('text-sm text-muted-foreground', !isSearching && 'sr-only')}>
        {isSearching && (
          <>
            <span className="font-bold text-foreground">{results.length}</span> hasil untuk “
            <span className="wrap-anywhere">{query}</span>”
          </>
        )}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[32px] bg-card px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-[16px] bg-tint-amber text-primary-foreground">
            <SearchX aria-hidden className="size-6" />
          </span>
          <h2 className="text-lg font-bold text-foreground">Tidak ada berita yang cocok</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Coba kata kunci lain atau periksa ejaannya.
          </p>
          <Button
            variant="secondary"
            className={`${pillButtonClassName} mt-2`}
            onClick={onClearSearch}
          >
            Hapus pencarian
          </Button>
        </div>
      ) : (
        <ul className={gridClassName}>
          {results.map((news, index) =>
            index === 0 && !isSearching ? (
              <li key={news.id} className="sm:col-span-2">
                <FeaturedNewsCard news={news} />
              </li>
            ) : (
              <li key={news.id}>
                <NewsCard news={news} />
              </li>
            ),
          )}
        </ul>
      )}
    </>
  )
}

function EmptyNews() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[32px] bg-card px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-[16px] bg-tint-amber text-primary-foreground">
        <Newspaper aria-hidden className="size-6" />
      </span>
      <h2 className="text-lg font-bold text-foreground">Belum ada berita edukasi</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Berita dan materi edukasi bahasa isyarat akan tampil di sini. Sambil menunggu, yuk belajar
        abjad isyarat di kamus.
      </p>
      <Button asChild className={`${pillButtonClassName} mt-2`}>
        <Link to="/kamus">Buka Kamus Abjad</Link>
      </Button>
    </div>
  )
}
