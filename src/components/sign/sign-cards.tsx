import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { describeSymbol, type SignCard } from '@/lib/sign-cards'
import { cn } from '@/lib/utils'

type SignCardSize = 'lg' | 'sm'

const sizeStyles: Record<
  SignCardSize,
  { item: string; radius: string; empty: string; badge: string }
> = {
  // Landing page translator: two per row on phones, 160px from `sm`.
  lg: {
    item: 'w-[calc(50%-4px)] sm:w-40',
    radius: 'rounded-[16px]',
    empty: 'text-5xl',
    badge: 'top-2 left-2 size-7 text-[13px]',
  },
  // Compact rows, e.g. the favorites page.
  sm: {
    item: 'w-16 sm:w-20',
    radius: 'rounded-[12px]',
    empty: 'text-2xl',
    badge: 'top-1 left-1 size-5 text-[10px]',
  },
}

type SignCardItemProps = {
  card: SignCard
  /**
   * The card's position in the `SignPreviewDialog` it opens. When the dialog closes,
   * focus returns to the card at the last position shown (looked up inside the nearest
   * `[data-sign-scope]` element, or else the card's own list).
   */
  index?: number
  mirrored?: boolean
  size?: SignCardSize
  onOpen: () => void
  style?: CSSProperties
  className?: string
}

/** One card: the hand-sign photo (click to enlarge), or a dashed empty card when there's none yet. */
export function SignCardItem({
  card,
  index,
  mirrored = false,
  size = 'lg',
  onOpen,
  style,
  className,
}: SignCardItemProps) {
  const styles = sizeStyles[size]
  return (
    <li style={style} data-sign-index={index} className={cn(styles.item, className)}>
      {card.image ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Perbesar isyarat ${describeSymbol(card.symbol)}`}
          className={cn(
            'group relative block aspect-square w-full overflow-hidden bg-muted ring-2 ring-transparent outline-none transition-shadow hover:ring-primary focus-visible:ring-primary',
            styles.radius,
          )}
        >
          <SignImage
            card={card}
            mirrored={mirrored}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <SymbolBadge symbol={card.symbol} className={styles.badge} />
          {size === 'lg' && (
            <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Expand className="size-3.5" aria-hidden />
            </span>
          )}
        </button>
      ) : (
        <div
          className={cn(
            'relative flex aspect-square w-full items-center justify-center border-2 border-dashed border-primary/40 bg-muted',
            styles.radius,
          )}
        >
          <span
            className={cn('font-heading font-extrabold text-primary-foreground/40', styles.empty)}
          >
            {card.symbol}
          </span>
          <span className="sr-only">Gambar isyarat belum tersedia</span>
        </div>
      )}
    </li>
  )
}

type SignImageProps = {
  card: SignCard
  mirrored: boolean
  className?: string
}

/** Mirroring sits on the wrapper so it can't clash with transforms on the image. */
function SignImage({ card, mirrored, className }: SignImageProps) {
  return (
    <span
      className={cn('block size-full transition-transform duration-300', mirrored && '-scale-x-100')}
    >
      <img
        src={card.image}
        alt={`Isyarat BISINDO ${describeSymbol(card.symbol)}`}
        width={800}
        height={800}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn('size-full object-cover', className)}
      />
    </span>
  )
}

function SymbolBadge({ symbol, className }: { symbol: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute flex min-w-fit items-center justify-center rounded-full bg-primary px-1 leading-none font-bold text-primary-foreground shadow-md',
        className,
      )}
    >
      {symbol}
    </span>
  )
}

const navButtonClassName =
  'h-9 shrink-0 rounded-full border-0 px-4 font-bold aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-secondary'

type SignPreviewDialogProps = {
  cards: SignCard[]
  /** The card being shown, or null when closed. */
  index: number | null
  mirrored?: boolean
  onIndexChange: (index: number | null) => void
}

/** Enlarged view of one card, with previous/next (also ← / → keys) through the sentence. */
export function SignPreviewDialog({
  cards,
  index,
  mirrored = false,
  onIndexChange,
}: SignPreviewDialogProps) {
  const card = index === null ? undefined : cards[index]
  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < cards.length - 1

  const contentRef = useRef<HTMLDivElement>(null)
  /** What had focus when the dialog opened (usually the clicked card). */
  const openerRef = useRef<HTMLElement | null>(null)
  /** The last card shown; after ←/→ that may not be the one that was clicked. */
  const lastIndexRef = useRef<number | null>(null)
  useEffect(() => {
    if (index !== null) lastIndexRef.current = index
  }, [index])

  function go(delta: number) {
    if (index === null) return
    const next = index + delta
    if (next >= 0 && next < cards.length) onIndexChange(next)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') go(-1)
    if (event.key === 'ArrowRight') go(1)
  }

  /** The dialog has no trigger button, so focus goes back to the last card shown. */
  function returnFocus() {
    const opener = openerRef.current
    const last = lastIndexRef.current
    const scope = opener?.closest('[data-sign-scope]') ?? opener?.closest('ul')
    const lastCard =
      last === null ? null : scope?.querySelector<HTMLElement>(`[data-sign-index="${last}"] button`)
    ;(lastCard ?? opener)?.focus()
    openerRef.current = null
    lastIndexRef.current = null
  }

  return (
    <Dialog open={card !== undefined} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        ref={contentRef}
        onKeyDown={handleKeyDown}
        // Focus the dialog itself, not a button that can become unusable at the first or
        // last card, so ←/→ always work and screen readers start at the title.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          openerRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null
          contentRef.current?.focus()
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocus()
        }}
        className="gap-4 rounded-[32px] bg-card p-4 sm:max-w-md"
      >
        {card && index !== null && (
          <>
            <div className="flex items-center gap-3 pr-8">
              <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-2 font-heading text-xl font-extrabold text-primary-foreground shadow-md">
                {card.symbol}
              </span>
              <div className="flex flex-col">
                <DialogTitle className="text-base font-bold text-foreground">
                  {describeSymbol(card.symbol)}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Isyarat BISINDO · {index + 1} dari {cards.length}
                </DialogDescription>
              </div>
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-muted">
              {card.image ? (
                <SignImage card={card} mirrored={mirrored} />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-primary/40">
                  <span className="font-heading text-8xl font-extrabold text-primary-foreground/40">
                    {card.symbol}
                  </span>
                  <span className="text-sm text-muted-foreground">Gambar isyarat belum tersedia</span>
                </div>
              )}
            </div>

            {cards.length > 1 && (
              <div className="flex min-w-0 items-center justify-between gap-2">
                {/* aria-disabled (not disabled) keeps a focused button focused at the ends. */}
                <Button
                  type="button"
                  variant="secondary"
                  aria-disabled={!hasPrev}
                  onClick={() => go(-1)}
                  className={navButtonClassName}
                >
                  <ChevronLeft aria-hidden />
                  <span className="max-[359px]:sr-only">Sebelumnya</span>
                </Button>
                {/* Position dots only from sm: on phones they'd push the row past the edge. */}
                <div className="hidden min-w-0 items-center gap-1 sm:flex" aria-hidden>
                  {cards.length <= 12 &&
                    cards.map((c, i) => (
                      <span
                        key={`${c.symbol}-${i}`}
                        className={cn(
                          'size-1.5 rounded-full transition-colors',
                          i === index ? 'bg-primary' : 'bg-secondary',
                        )}
                      />
                    ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  aria-disabled={!hasNext}
                  onClick={() => go(1)}
                  className={navButtonClassName}
                >
                  <span className="max-[359px]:sr-only">Berikutnya</span>
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
