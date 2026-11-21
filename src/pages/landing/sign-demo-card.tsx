import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { toast } from 'sonner'

import { SignCardItem, SignPreviewDialog } from '@/components/sign/sign-cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/hooks/use-session'
import { getFavoriteErrorMessage } from '@/lib/api/favorites'
import {
  useDeleteFavoriteSentence,
  useFavoriteSentences,
  useSaveFavoriteSentence,
  useTranslation,
} from '@/lib/api/queries'
import {
  isSameSentence,
  normalizeSentence,
  SENTENCE_PARAM,
  toSignCards,
} from '@/lib/sign-cards'
import { cn } from '@/lib/utils'
import mirrorIcon from '@/assets/landing/icon-mirror.svg'
import playIcon from '@/assets/landing/icon-play.svg'
import signHandIcon from '@/assets/landing/icon-sign-hand.svg'
import speedIcon from '@/assets/landing/icon-speed.svg'

const SPEEDS = [0.5, 1, 1.5, 2] as const
const BASE_STAGGER_MS = 150
const BASE_DURATION_MS = 300
const DEFAULT_TEXT = 'HALO'
/** Same limit as a saved favorite sentence on the API. */
const MAX_LENGTH = 255

const chipClassName =
  'h-6 gap-1 rounded-full border-0 px-3 py-1 text-[11px] leading-4 font-bold tracking-[0.44px] text-foreground'

export function SignDemoCard() {
  const [searchParams] = useSearchParams()
  const [initialText] = useState(
    () => normalizeSentence(searchParams.get(SENTENCE_PARAM) ?? '').slice(0, MAX_LENGTH) || DEFAULT_TEXT,
  )
  const [text, setText] = useState(initialText)
  /** The sentence being shown (set on "Peragakan"). */
  const [sentence, setSentence] = useState(initialText)
  const [playId, setPlayId] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [mirrored, setMirrored] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const translation = useTranslation(sentence)
  const cards = useMemo(
    () => toSignCards(sentence, translation.data ?? []),
    [sentence, translation.data],
  )
  const loading = cards.length > 0 && translation.isPending

  const speed = SPEEDS[speedIndex]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSentence(normalizeSentence(text))
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
              Kartu Isyarat Tangan ({cards.length} Kartu)
            </h2>
            <span className="rounded-full bg-tint-amber px-2 py-0.5 text-[10px] leading-4 font-bold tracking-[0.4px] text-primary-foreground">
              BISINDO
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <FavoriteToggle sentence={sentence} />
          </div>
        </div>

        <div className="flex min-h-[140px] flex-col gap-2">
          {cards.length === 0 ? (
            <p className="flex w-full flex-1 items-center justify-center rounded-[24px] bg-card p-2 text-sm text-muted-foreground drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
              Ketik kata atau kalimat lalu tekan Peragakan.
            </p>
          ) : loading ? (
            <ul
              aria-label="Memuat isyarat"
              aria-busy
              className="flex w-full flex-wrap content-center items-center gap-2 rounded-[24px] bg-card p-2 drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)] sm:w-auto"
            >
              {cards.map((card, index) => (
                <li key={`${card.symbol}-${index}`} className="w-[calc(50%-4px)] sm:w-40">
                  <Skeleton className="aspect-square w-full rounded-[16px] bg-muted" />
                </li>
              ))}
            </ul>
          ) : (
            <>
              <ul
                key={playId}
                aria-live="polite"
                className="flex w-full flex-wrap content-center items-center gap-2 rounded-[24px] bg-card p-2 drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)] sm:w-auto"
              >
                {cards.map((card, index) => (
                  <SignCardItem
                    key={`${card.symbol}-${index}`}
                    card={card}
                    mirrored={mirrored}
                    onOpen={() => setPreviewIndex(index)}
                    className="animate-in fade-in zoom-in-95 motion-reduce:animate-none"
                    style={{
                      animationDelay: `${(index * BASE_STAGGER_MS) / speed}ms`,
                      animationDuration: `${BASE_DURATION_MS / speed}ms`,
                      animationFillMode: 'both',
                    }}
                  />
                ))}
              </ul>
              {translation.isError && (
                <p role="status" className="px-2 text-xs text-muted-foreground">
                  Gambar isyarat tidak dapat dimuat saat ini. Coba lagi nanti.
                </p>
              )}
            </>
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
          maxLength={MAX_LENGTH}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ketik kata atau kalimat…"
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
        cards={cards}
        index={previewIndex}
        mirrored={mirrored}
        onIndexChange={setPreviewIndex}
      />
    </div>
  )
}

/**
 * Bookmark for the sentence being shown. Logged-out visitors are sent to /login
 * and come back to the same sentence afterwards.
 */
function FavoriteToggle({ sentence }: { sentence: string }) {
  const navigate = useNavigate()
  const { user } = useSession()
  const favorites = useFavoriteSentences(user !== null)
  const save = useSaveFavoriteSentence()
  const remove = useDeleteFavoriteSentence()

  const saved = favorites.data?.find((favorite) => isSameSentence(favorite.sentence, sentence))
  const busy = save.isPending || remove.isPending

  async function toggle() {
    if (!user) {
      toast.info('Masuk dulu untuk menyimpan kalimat favorit.')
      navigate('/login', { state: { from: `/?${SENTENCE_PARAM}=${encodeURIComponent(sentence)}` } })
      return
    }
    try {
      if (saved) {
        await remove.mutateAsync(saved.id)
        toast.success('Kalimat dihapus dari favorit.')
      } else {
        await save.mutateAsync(sentence)
        toast.success('Kalimat disimpan ke favorit.', {
          action: { label: 'Lihat', onClick: () => navigate('/favorit') },
        })
      }
    } catch (error) {
      toast.error(getFavoriteErrorMessage(error))
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        chipClassName,
        saved && 'bg-primary text-primary-foreground hover:bg-primary/90',
      )}
      aria-label="Simpan kalimat ke favorit"
      aria-pressed={Boolean(saved)}
      disabled={sentence === '' || busy}
      onClick={toggle}
    >
      {saved ? (
        <BookmarkCheck className="size-3.5" aria-hidden />
      ) : (
        <Bookmark className="size-3.5" aria-hidden />
      )}
      {saved ? 'Tersimpan' : 'Simpan'}
    </Button>
  )
}
