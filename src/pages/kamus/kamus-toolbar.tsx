import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { CategoryFilter } from '@/pages/kamus/kamus'
import { pillButtonClassName } from '@/pages/kamus/kamus-styles'
import mirrorIcon from '@/assets/landing/icon-mirror.svg'

/** Symbols are at most 3 characters; the extra room lets a word be sent on to the translator. */
const MAX_QUERY_LENGTH = 30

type KamusToolbarProps = {
  query: string
  onQueryChange: (query: string) => void
  category: CategoryFilter
  /** Chips to show; none hides the chip row. */
  categoryOptions: { value: CategoryFilter; label: string }[]
  onCategoryChange: (category: CategoryFilter) => void
}

/** Search box and category chips: one row from `md`; on phones the chips fill a row below. */
export function KamusToolbar({
  query,
  onQueryChange,
  category,
  categoryOptions,
  onCategoryChange,
}: KamusToolbarProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative min-w-0 flex-1">
        <label htmlFor="kamus-search" className="sr-only">
          Cari huruf, angka, atau simbol
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="kamus-search"
          type="search"
          value={query}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Cari huruf, angka, simbol…"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="h-11 rounded-full border-0 bg-card pr-4 pl-10 font-bold uppercase shadow-[0_1px_1px_rgb(0_0_0/0.05)] placeholder:font-medium placeholder:normal-case focus-visible:ring-primary/50"
        />
      </div>

      {categoryOptions.length > 0 && (
        <div
          role="group"
          aria-label="Filter kategori"
          className="flex w-full shrink-0 items-center gap-1 rounded-full bg-surface-low p-1 md:w-fit"
        >
          {categoryOptions.map((option) => {
            const active = option.value === category
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(option.value)}
                className={cn(
                  'flex-1 rounded-full px-2 py-2 text-sm leading-5 font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary md:flex-none md:px-4',
                  active
                    ? 'bg-primary text-primary-foreground drop-shadow-[0_2px_0_var(--color-primary-foreground)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

type MirrorToggleProps = {
  mirrored: boolean
  onMirroredChange: (mirrored: boolean) => void
}

/** "Cermin": flips every photo horizontally, like the landing page translator. */
export function MirrorToggle({ mirrored, onMirroredChange }: MirrorToggleProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      aria-pressed={mirrored}
      title="Balik gambar seperti cermin"
      onClick={() => onMirroredChange(!mirrored)}
      className={cn(
        pillButtonClassName,
        'bg-card text-foreground shadow-[0_1px_1px_rgb(0_0_0/0.05)] hover:bg-muted',
        mirrored && 'ring-2 ring-primary',
      )}
    >
      <img src={mirrorIcon} alt="" />
      Cermin
    </Button>
  )
}
