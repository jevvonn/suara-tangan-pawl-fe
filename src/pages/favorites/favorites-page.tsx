import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bookmark, BookmarkX, Play } from 'lucide-react'
import { toast } from 'sonner'

import { SignCardItem, SignPreviewDialog } from '@/components/sign/sign-cards'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getFavoriteErrorMessage } from '@/lib/api/favorites'
import {
  useDeleteFavoriteSentence,
  useFavoriteSentences,
  useSaveFavoriteSentence,
} from '@/lib/api/queries'
import type { FavoriteSentence } from '@/lib/api/types'
import { formatDate } from '@/lib/format'
import { SENTENCE_PARAM, toSignCards } from '@/lib/sign-cards'

const pillButtonClassName =
  'h-9 gap-1.5 rounded-full border-0 px-4 text-[13px] leading-[18px] font-bold tracking-[0.26px]'

/** /favorit: the logged-in user's saved sentences and their hand signs. */
export function FavoritesPage() {
  const { data: favorites, isPending, isError, error, refetch } = useFavoriteSentences()

  return (
    <section className="px-4 py-10 sm:px-6">
      <title>Kalimat Favorit · Suara Tangan</title>
      <div className="mx-auto flex max-w-[880px] flex-col gap-6 sm:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[32px] leading-[40px] font-extrabold text-foreground sm:text-[40px] sm:leading-[48px]">
            Kalimat Favorit
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            Kalimat yang kamu simpan dari penerjemah, lengkap dengan isyarat tangannya.
          </p>
        </div>

        {isError ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-[32px] bg-card p-6">
            <p className="text-sm text-destructive">
              Gagal memuat kalimat favorit: {getFavoriteErrorMessage(error)}
            </p>
            <Button variant="secondary" className={pillButtonClassName} onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : isPending ? (
          <ul aria-label="Memuat kalimat favorit" aria-busy className="flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-44 rounded-[32px] bg-card" />
              </li>
            ))}
          </ul>
        ) : favorites.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{favorites.length}</span> kalimat tersimpan
            </p>
            <ul className="flex flex-col gap-4">
              {favorites.map((favorite) => (
                <FavoriteItem key={favorite.id} favorite={favorite} />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

function FavoriteItem({ favorite }: { favorite: FavoriteSentence }) {
  const navigate = useNavigate()
  const remove = useDeleteFavoriteSentence()
  const save = useSaveFavoriteSentence()
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const cards = useMemo(
    () => toSignCards(favorite.sentence, favorite.letters),
    [favorite.sentence, favorite.letters],
  )
  const missing = cards.filter((card) => !card.image).length

  async function handleRemove() {
    try {
      await remove.mutateAsync(favorite.id)
      toast.success('Kalimat dihapus dari favorit.', {
        action: {
          label: 'Urungkan',
          onClick: () =>
            save.mutate(favorite.sentence, {
              onError: (err) => toast.error(getFavoriteErrorMessage(err)),
            }),
        },
      })
    } catch (err) {
      toast.error(getFavoriteErrorMessage(err))
    }
  }

  return (
    <li>
      <article className="flex flex-col gap-4 rounded-[32px] bg-card p-4 drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-display text-xl font-bold break-words text-foreground uppercase">
              {favorite.sentence}
            </h2>
            <p className="text-xs text-muted-foreground">
              Disimpan {formatDate(favorite.createdAt)} · {cards.length} kartu
              {missing > 0 && ` · ${missing} belum ada gambar`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              className={pillButtonClassName}
              onClick={() =>
                navigate(`/?${SENTENCE_PARAM}=${encodeURIComponent(favorite.sentence)}`)
              }
            >
              <Play aria-hidden />
              Peragakan
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={remove.isPending}
              onClick={handleRemove}
              aria-label={`Hapus "${favorite.sentence}" dari favorit`}
              title="Hapus dari favorit"
              className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <BookmarkX aria-hidden />
            </Button>
          </div>
        </div>

        <ul
          aria-label={`Isyarat untuk "${favorite.sentence}"`}
          className="flex flex-wrap gap-2 rounded-[24px] bg-muted p-2"
        >
          {cards.map((card, index) => (
            <SignCardItem
              key={`${card.symbol}-${index}`}
              card={card}
              size="sm"
              onOpen={() => setPreviewIndex(index)}
            />
          ))}
        </ul>
      </article>

      <SignPreviewDialog cards={cards} index={previewIndex} onIndexChange={setPreviewIndex} />
    </li>
  )
}

function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[32px] bg-card px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-[16px] bg-tint-amber text-primary-foreground">
        <Bookmark aria-hidden className="size-6" />
      </span>
      <p className="text-lg font-bold text-foreground">Belum ada kalimat favorit</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Peragakan kata atau kalimat di beranda, lalu tekan tombol Simpan untuk menyimpannya di sini.
      </p>
      <Button asChild className={`${pillButtonClassName} mt-2`}>
        <Link to="/">Ke Penerjemah</Link>
      </Button>
    </div>
  )
}
