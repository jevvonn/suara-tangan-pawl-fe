import { useState, type CSSProperties, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
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

  const speed = SPEEDS[speedIndex]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLetters(toSignLetters(text))
    setPlayId((id) => id + 1)
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
              className="flex min-h-[140px] flex-wrap content-center items-center gap-2 rounded-[24px] bg-card p-2 drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)]"
            >
              {letters.map((item, index) => (
                <SignCard
                  key={`${item.letter}-${index}`}
                  item={item}
                  mirrored={mirrored}
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
    </div>
  )
}

type SignCardProps = {
  item: SignLetter
  mirrored: boolean
  style: CSSProperties
}

function SignCard({ item, mirrored, style }: SignCardProps) {
  return (
    <li
      style={style}
      className="flex h-[110px] w-[130px] min-w-[70px] flex-col items-center justify-center rounded-[16px] bg-muted p-2.5 animate-in fade-in zoom-in-95 motion-reduce:animate-none"
    >
      <span className="mb-1 flex size-6 items-center justify-center rounded-full bg-tint-amber pb-px text-[11px] leading-6 font-bold text-primary-foreground">
        {item.letter}
      </span>
      {item.image ? (
        <img
          src={item.image}
          alt={`Bentuk tangan huruf ${item.letter}`}
          className={cn('transition-transform', mirrored && '-scale-x-100')}
        />
      ) : (
        <span aria-hidden className="h-[37px]" />
      )}
      <span className="text-[10px] leading-6 whitespace-nowrap text-muted-foreground">
        {item.description}
      </span>
    </li>
  )
}
