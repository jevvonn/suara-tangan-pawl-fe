import { useMemo, useState } from 'react'

import { SignCardItem, SignPreviewDialog } from '@/components/sign/sign-cards'
import { useLetters } from '@/lib/api/queries'
import { cn } from '@/lib/utils'
import {
  filterEntries,
  getKamusErrorMessage,
  groupEntries,
  normalizeQuery,
  SECTIONS,
  toEntries,
  type CategoryFilter,
  type KamusSectionData,
} from '@/pages/kamus/kamus'
import { KamusEmpty, KamusError, KamusNoResults, KamusSkeleton } from '@/pages/kamus/kamus-states'
import { sectionCardClassName, signGridClassName } from '@/pages/kamus/kamus-styles'
import { KamusToolbar, MirrorToggle } from '@/pages/kamus/kamus-toolbar'

/** /kamus: every letter, number and symbol from the API with its BISINDO hand sign. */
export function KamusPage() {
  const { data: letters, isError, error, refetch } = useLetters()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [mirrored, setMirrored] = useState(false)
  /** The enlarged card, by symbol so it survives a refetch reordering the list. */
  const [previewSymbol, setPreviewSymbol] = useState<string | null>(null)

  const entries = useMemo(() => toEntries(letters ?? []), [letters])
  const visible = useMemo(
    () => filterEntries(entries, query, category),
    [entries, query, category],
  )
  // Sections in page order; their entries concatenated are what the dialog walks through.
  const sections = useMemo(() => groupEntries(visible), [visible])
  const ordered = useMemo(() => sections.flatMap((section) => section.entries), [sections])
  // Each card's position in `ordered`, so the dialog can return focus to the last card shown.
  const indexBySymbol = useMemo(
    () => new Map(ordered.map((entry, index) => [entry.symbol, index])),
    [ordered],
  )

  // Chips only when there is more than one category to choose from.
  const categoryOptions = useMemo(() => {
    const present = SECTIONS.filter((section) =>
      entries.some((entry) => entry.category === section.category),
    )
    if (present.length < 2) return []
    return [
      { value: 'all' as const, label: 'Semua' },
      ...present.map((section) => ({ value: section.category, label: section.title })),
    ]
  }, [entries])

  const foundIndex =
    previewSymbol === null ? -1 : ordered.findIndex((entry) => entry.symbol === previewSymbol)
  const previewIndex = foundIndex === -1 ? null : foundIndex

  const searchText = normalizeQuery(query)
  const filtered = searchText !== '' || category !== 'all'
  const categoryLabel = SECTIONS.find((section) => section.category === category)?.title

  function resetFilters() {
    setQuery('')
    setCategory('all')
  }

  let content
  // Keep showing loaded letters if a background refetch fails.
  if (letters) {
    content =
      entries.length === 0 ? (
        <KamusEmpty />
      ) : (
        <>
          <KamusToolbar
            query={query}
            onQueryChange={setQuery}
            category={category}
            categoryOptions={categoryOptions}
            onCategoryChange={setCategory}
          />

          <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
            <p role="status" className="text-sm text-muted-foreground">
              {filtered ? (
                <>
                  Menampilkan <span className="font-bold text-foreground">{visible.length}</span>{' '}
                  dari {entries.length} isyarat
                </>
              ) : (
                <>
                  <span className="font-bold text-foreground">{entries.length}</span> isyarat
                </>
              )}
            </p>
            <MirrorToggle mirrored={mirrored} onMirroredChange={setMirrored} />
          </div>

          {sections.length === 0 ? (
            <KamusNoResults query={searchText} categoryLabel={categoryLabel} onReset={resetFilters} />
          ) : (
            sections.map((section) => (
              <KamusSection
                key={section.category}
                section={section}
                indexBySymbol={indexBySymbol}
                mirrored={mirrored}
                onOpen={setPreviewSymbol}
              />
            ))
          )}

          <SignPreviewDialog
            cards={ordered}
            index={previewIndex}
            mirrored={mirrored}
            onIndexChange={(index) =>
              setPreviewSymbol(index === null ? null : (ordered[index]?.symbol ?? null))
            }
          />
        </>
      )
  } else if (isError) {
    content = (
      <KamusError message={getKamusErrorMessage(error)} onRetry={() => void refetch()} />
    )
  } else {
    content = <KamusSkeleton />
  }

  return (
    <section aria-labelledby="kamus-title" className="px-4 py-10 sm:px-6">
      <title>Kamus Abjad · Suara Tangan</title>
      {/* data-sign-scope: the preview dialog finds the card to refocus across all sections. */}
      <div data-sign-scope className="mx-auto flex max-w-[880px] flex-col gap-6 sm:px-8">
        <div className="flex flex-col gap-2">
          <h1
            id="kamus-title"
            className="font-heading text-[32px] leading-[40px] font-extrabold text-foreground sm:text-[40px] sm:leading-[48px]"
          >
            Kamus Abjad
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            Pelajari isyarat tangan BISINDO untuk setiap huruf, angka, dan simbol. Klik kartu
            untuk melihatnya lebih besar.
          </p>
        </div>

        {content}
      </div>
    </section>
  )
}

type KamusSectionProps = {
  section: KamusSectionData
  /** Position of each card in the preview dialog's list (across all sections). */
  indexBySymbol: Map<string, number>
  mirrored: boolean
  onOpen: (symbol: string) => void
}

function KamusSection({ section, indexBySymbol, mirrored, onOpen }: KamusSectionProps) {
  const headingId = `kamus-${section.category}`
  return (
    <section aria-labelledby={headingId} className={sectionCardClassName}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-[12px] font-heading text-base font-extrabold text-primary-foreground',
              section.tint,
            )}
          >
            {section.glyph}
          </span>
          <h2
            id={headingId}
            className="font-heading text-2xl leading-8 font-extrabold text-foreground"
          >
            {section.title}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs leading-4 font-bold text-muted-foreground">
          {section.entries.length} isyarat
        </span>
      </div>

      <ul aria-labelledby={headingId} className={signGridClassName}>
        {section.entries.map((entry) => (
          <SignCardItem
            key={entry.id}
            card={entry}
            index={indexBySymbol.get(entry.symbol)}
            mirrored={mirrored}
            onOpen={() => onOpen(entry.symbol)}
            // The shared 'lg' size sets flex widths; here the grid sizes the cards.
            className="w-full sm:w-full"
          />
        ))}
      </ul>
    </section>
  )
}
