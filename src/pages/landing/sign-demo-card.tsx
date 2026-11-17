import {
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toSignLetters, type SignLetter } from '@/pages/landing/sign-letters'
import mirrorIcon from '@/assets/landing/icon-mirror.svg'
import playIcon from '@/assets/landing/icon-play.svg'
import signHandIcon from '@/assets/landing/icon-sign-hand.svg'
import speedIcon from '@/assets/landing/icon-speed.svg'

const SPEEDS = [0.5, 1, 1.5, 2] as const
const BASE_STAGGER_MS = 150
const BASE_DURATION_MS = 300
const DEFAULT_TEXT = 'HALO'

const chipClassName =
  'h-6 gap-1 rounded-full border-0 px-3 py-1 text-[11px] leading-4 font-bold tracking-[0.44px] text-foreground'

export function SignDemoCard() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [letters, setLetters] = useState(() => toSignLetters(DEFAULT_TEXT))
  const [playId, setPlayId] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [mirrored, setMirrored] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const speed = SPEEDS[speedIndex]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLetters(toSignLetters(text))
    setPlayId((id) => id + 1)
    setPreviewIndex(null)
  }

  return (
    <div className="relative flex w-full flex-col gap-4 rounded-[48px] bg-card p-4 sm:p-6">
      {/* Shadow layer starts 16px below the top edge, as in the design */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-4 bottom-0 rounded-[48px] shadow-xl"
      />

      <div className="relative flex flex-col gap-2 rounded-[32px] bg-muted p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={signHandIcon} alt="" />
            <h2 className="text-[13px] leading-[18px] font-bold tracking-[0.26px] text-foreground">
              Kartu Isyarat Tangan ({letters.length} Huruf)
            </h2>
            <span className="rounded-full bg-tint-amber px-2 py-0.5 text-[10px] leading-4 font-bold tracking-[0.4px] text-primary-foreground">
              BISINDO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className={chipClassName}
              aria-label={`Kecepatan peragaan ${speed.toFixed(1)}x`}
              onClick={() => setSpeedIndex((i) => (i + 1) % SPEEDS.length)}
            >
              <img src={speedIcon} alt="" />
              {speed.toFixed(1)}x
            </Button>
            <Button
              type="button"
              variant="secondary"
              className={cn(chipClassName, mirrored && 'ring-2 ring-primary')}
              aria-pressed={mirrored}
              onClick={() => setMirrored((m) => !m)}
            >
              <img src={mirrorIcon} alt="" />
              Cermin
            </Button>
          </div>
        </div>

        <div className="flex min-h-[140px]">
          {letters.length > 0 ? (
            <ul
              key={playId}
              aria-live="polite"
              className="flex w-full flex-wrap content-center items-center gap-2 rounded-[24px] bg-card p-2 drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)] sm:w-auto"
            >
              {letters.map((item, index) => (
                <SignCard
                  key={`${item.letter}-${index}`}
                  item={item}
                  mirrored={mirrored}
                  onOpen={() => setPreviewIndex(index)}
                  style={{
                    animationDelay: `${(index * BASE_STAGGER_MS) / speed}ms`,
                    animationDuration: `${BASE_DURATION_MS / speed}ms`,
                    animationFillMode: 'both',
                  }}
                />
              ))}
            </ul>
          ) : (
            <p className="flex w-full items-center justify-center rounded-[24px] bg-card p-2 text-sm text-muted-foreground drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
              Ketik huruf A–Z lalu tekan Peragakan.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="sign-text" className="sr-only">
          Kata atau kalimat
        </label>
        <Input
          id="sign-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ketik kata…"
          autoComplete="off"
          className="h-16 rounded-[48px] border-0 bg-muted py-[19.5px] pr-36 pl-5 font-display text-xl leading-normal font-bold text-foreground uppercase placeholder:text-muted-foreground/60 placeholder:normal-case focus-visible:ring-primary/50 md:text-xl"
        />
        <Button
          type="submit"
          className="absolute top-1/2 right-3 h-auto -translate-y-1/2 gap-1.5 rounded-full border-0 px-5 py-2.5 text-[13px] leading-[18px] font-bold tracking-[0.26px] shadow-md hover:bg-primary/90"
        >
          <img src={playIcon} alt="" />
          Peragakan
        </Button>
      </form>

      <SignPreviewDialog
        letters={letters}
        index={previewIndex}
        mirrored={mirrored}
        onIndexChange={setPreviewIndex}
      />
    </div>
  )
}

type SignCardProps = {
  item: SignLetter
  mirrored: boolean
  onOpen: () => void
  style: CSSProperties
}

function SignCard({ item, mirrored, onOpen, style }: SignCardProps) {
  return (
    <li
      style={style}
      className="w-[calc(50%-4px)] animate-in fade-in zoom-in-95 motion-reduce:animate-none sm:w-40"
    >
      {item.image ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Perbesar isyarat huruf ${item.letter}`}
          className="group relative block aspect-square w-full overflow-hidden rounded-[16px] bg-muted outline-none ring-2 ring-transparent transition-shadow hover:ring-primary focus-visible:ring-primary"
        >
          <SignImage item={item} mirrored={mirrored} className="transition-transform duration-300 group-hover:scale-105" />
          <LetterBadge letter={item.letter} />
          <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Expand className="size-3.5" aria-hidden />
          </span>
        </button>
      ) : (
        <div className="relative flex aspect-square w-full items-center justify-center rounded-[16px] border-2 border-dashed border-primary/40 bg-muted">
          <span className="font-heading text-5xl font-extrabold text-primary-foreground/40">
            {item.letter}
          </span>
          <span className="sr-only">Gambar isyarat belum tersedia</span>
        </div>
      )}
    </li>
  )
}

type SignImageProps = {
  item: SignLetter
  mirrored: boolean
  className?: string
}

/** Mirroring sits on the wrapper so it can't clash with transforms on the image. */
function SignImage({ item, mirrored, className }: SignImageProps) {
  return (
    <span
      className={cn(
        'block size-full transition-transform duration-300',
        mirrored && '-scale-x-100',
      )}
    >
      <img
        src={item.image}
        alt={`Isyarat BISINDO huruf ${item.letter}`}
        width={800}
        height={800}
        decoding="async"
        draggable={false}
        className={cn('size-full object-cover', className)}
      />
    </span>
  )
}

function LetterBadge({ letter, className }: { letter: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-primary text-[13px] leading-none font-bold text-primary-foreground shadow-md',
        className,
      )}
    >
      {letter}
    </span>
  )
}

type SignPreviewDialogProps = {
  letters: SignLetter[]
  index: number | null
  mirrored: boolean
  onIndexChange: (index: number | null) => void
}

function SignPreviewDialog({
  letters,
  index,
  mirrored,
  onIndexChange,
}: SignPreviewDialogProps) {
  const item = index === null ? undefined : letters[index]
  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < letters.length - 1

  function go(delta: number) {
    if (index === null) return
    const next = index + delta
    if (next >= 0 && next < letters.length) onIndexChange(next)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') go(-1)
    if (event.key === 'ArrowRight') go(1)
  }

  return (
    <Dialog
      open={item !== undefined}
      onOpenChange={(open) => !open && onIndexChange(null)}
    >
      <DialogContent
        onKeyDown={handleKeyDown}
        className="gap-4 rounded-[32px] bg-card p-4 sm:max-w-md"
      >
        {item && index !== null && (
          <>
            <div className="flex items-center gap-3 pr-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary font-heading text-xl font-extrabold text-primary-foreground shadow-md">
                {item.letter}
              </span>
              <div className="flex flex-col">
                <DialogTitle className="text-base font-bold text-foreground">
                  Huruf {item.letter}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Isyarat BISINDO · {index + 1} dari {letters.length}
                </DialogDescription>
              </div>
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-muted">
              {item.image ? (
                <SignImage item={item} mirrored={mirrored} />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/40 rounded-[24px]">
                  <span className="font-heading text-8xl font-extrabold text-primary-foreground/40">
                    {item.letter}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Gambar isyarat belum tersedia
                  </span>
                </div>
              )}
            </div>

            {letters.length > 1 && (
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!hasPrev}
                  onClick={() => go(-1)}
                  className="h-9 rounded-full border-0 px-4 font-bold"
                >
                  <ChevronLeft aria-hidden />
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1" aria-hidden>
                  {letters.length <= 12 && letters.map((l, i) => (
                    <span
                      key={`${l.letter}-${i}`}
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
                  disabled={!hasNext}
                  onClick={() => go(1)}
                  className="h-9 rounded-full border-0 px-4 font-bold"
                >
                  Berikutnya
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
