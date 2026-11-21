import { useMemo, useState } from 'react'
import { Hand, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api/errors'
import { getLetterCategory, type LetterCategory } from '@/lib/api/letters'
import { useDeleteLetter, useLetters } from '@/lib/api/queries'
import type { Letter } from '@/lib/api/types'
import { formatDate } from '@/lib/format'
import { ConfirmDeleteDialog } from '@/pages/admin/components/confirm-delete-dialog'
import { EmptyState } from '@/pages/admin/components/empty-state'
import { FilterChips } from '@/pages/admin/components/filter-chips'
import { PageHeader } from '@/pages/admin/components/page-header'
import { SearchInput } from '@/pages/admin/components/search-input'
import { getLetterErrorMessage } from '@/pages/admin/letters/letter-errors'
import { LetterFormDialog } from '@/pages/admin/letters/letter-form-dialog'

const CATEGORY_LABEL: Record<LetterCategory, string> = {
  letter: 'Huruf',
  number: 'Angka',
  symbol: 'Simbol',
}

type CategoryFilter = 'all' | LetterCategory

const FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'letter', label: 'Huruf' },
  { value: 'number', label: 'Angka' },
  { value: 'symbol', label: 'Simbol' },
]

export function LettersPage() {
  const { data: letters, isPending, isError, error, refetch } = useLetters()
  const deleteLetter = useDeleteLetter()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<Letter | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<Letter | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toUpperCase()
    return (letters ?? []).filter(
      (l) =>
        (category === 'all' || getLetterCategory(l.symbol) === category) &&
        l.symbol.includes(query),
    )
  }, [letters, search, category])

  function openCreate() {
    setEditing(null)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  function openEdit(letter: Letter) {
    setEditing(letter)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteLetter.mutateAsync(deleting.id)
      toast.success(`"${deleting.symbol}" berhasil dihapus.`)
      setDeleteOpen(false)
    } catch (err) {
      toast.error(getLetterErrorMessage(err))
      if (err instanceof ApiError && err.status === 404) {
        // Already deleted elsewhere: close and show the current list.
        setDeleteOpen(false)
        void refetch()
      }
    }
  }

  return (
    <>
      <PageHeader
        title="Letters"
        description="Kelola huruf, angka, dan simbol beserta gambar isyaratnya."
        actions={
          <Button variant="brand" size="pill" onClick={openCreate}>
            <Plus aria-hidden />
            Tambah Letter
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          label="Cari letter"
          placeholder="Cari huruf, angka, simbol…"
          value={search}
          onChange={setSearch}
        />
        <FilterChips
          label="Filter kategori"
          value={category}
          options={FILTER_OPTIONS}
          onChange={setCategory}
        />
      </div>

      {isError ? (
        <p role="alert" className="rounded-[32px] bg-card p-6 text-sm text-destructive">
          Gagal memuat data: {getLetterErrorMessage(error)}
        </p>
      ) : isPending ? (
        <LetterGrid>
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/5] rounded-[24px] bg-card" />
            </li>
          ))}
        </LetterGrid>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Hand}
          title={letters.length === 0 ? 'Belum ada letter' : 'Tidak ditemukan'}
          description={
            letters.length === 0
              ? 'Tambahkan huruf, angka, atau simbol pertama beserta gambar isyaratnya.'
              : 'Coba kata kunci atau filter lain.'
          }
          action={
            letters.length === 0 && (
              <Button variant="brand" size="pill" onClick={openCreate} className="mt-2">
                <Plus aria-hidden />
                Tambah Letter
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Menampilkan <span className="font-bold text-foreground">{filtered.length}</span> dari{' '}
            {letters.length} letter
          </p>
          <LetterGrid>
            {filtered.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                onEdit={() => openEdit(letter)}
                onDelete={() => {
                  setDeleting(letter)
                  setDeleteOpen(true)
                }}
              />
            ))}
          </LetterGrid>
        </>
      )}

      <LetterFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        letter={editing}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Hapus "${deleting?.symbol ?? ''}"?`}
        description="Gambar isyarat untuk karakter ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
        pending={deleteLetter.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}

function LetterGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </ul>
  )
}

type LetterCardProps = {
  letter: Letter
  onEdit: () => void
  onDelete: () => void
}

function LetterCard({ letter, onEdit, onDelete }: LetterCardProps) {
  const category = getLetterCategory(letter.symbol)
  return (
    <li className="flex flex-col gap-3 rounded-[24px] bg-card p-2 pb-3 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-muted">
        <img
          src={letter.imageUrl}
          alt={`Isyarat ${letter.symbol}`}
          decoding="async"
          className="size-full object-cover"
        />
        <span className="absolute top-2 left-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2 font-display text-sm font-bold text-primary-foreground shadow-md">
          {letter.symbol}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 flex-col">
          <span className="w-fit rounded-full bg-tint-amber px-2 py-0.5 text-[11px] leading-4 font-bold tracking-[0.44px] text-primary-foreground">
            {CATEGORY_LABEL[category]}
          </span>
          <span className="mt-1 truncate text-xs text-muted-foreground">
            {formatDate(letter.updatedAt)}
          </span>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Edit ${letter.symbol}`}
            className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={`Hapus ${letter.symbol}`}
            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
    </li>
  )
}
