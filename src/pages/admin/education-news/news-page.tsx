import { useMemo, useState } from 'react'
import { Newspaper, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { NewsThumbnail } from '@/components/news-thumbnail'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/api/errors'
import { useDeleteEducationNews, useEducationNews } from '@/lib/api/queries'
import type { EducationNews } from '@/lib/api/types'
import { formatDate } from '@/lib/format'
import { ConfirmDeleteDialog } from '@/pages/admin/components/confirm-delete-dialog'
import { EmptyState } from '@/pages/admin/components/empty-state'
import { PageHeader } from '@/pages/admin/components/page-header'
import { SearchInput } from '@/pages/admin/components/search-input'
import { NewsFormDialog } from '@/pages/admin/education-news/news-form-dialog'

export function EducationNewsPage() {
  const { data: newsList, isPending, isError, error } = useEducationNews()
  const deleteNews = useDeleteEducationNews()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<EducationNews | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<EducationNews | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (newsList ?? []).filter(
      (n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query),
    )
  }, [newsList, search])

  function openForm(news: EducationNews | null) {
    setEditing(news)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteNews.mutateAsync(deleting.id)
      toast.success('Berita berhasil dihapus.')
      setDeleteOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Education News"
        description="Kelola berita dan materi edukasi bahasa isyarat."
        actions={
          <Button variant="brand" size="pill" onClick={() => openForm(null)}>
            <Plus aria-hidden />
            Tambah Berita
          </Button>
        }
      />

      <SearchInput
        label="Cari berita"
        placeholder="Cari judul atau isi berita…"
        value={search}
        onChange={setSearch}
      />

      {isError ? (
        <p role="alert" className="rounded-[32px] bg-card p-6 text-sm text-destructive">
          Gagal memuat data: {getErrorMessage(error)}
        </p>
      ) : isPending ? (
        <NewsGrid>
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-80 rounded-[32px] bg-card" />
            </li>
          ))}
        </NewsGrid>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={newsList.length === 0 ? 'Belum ada berita' : 'Tidak ditemukan'}
          description={
            newsList.length === 0
              ? 'Tulis berita atau materi edukasi pertama.'
              : 'Coba kata kunci lain.'
          }
        />
      ) : (
        <NewsGrid>
          {filtered.map((news) => (
            <li
              key={news.id}
              className="flex flex-col overflow-hidden rounded-[32px] bg-card p-2 shadow-[0_1px_1px_rgb(0_0_0/0.05)]"
            >
              <div className="aspect-video overflow-hidden rounded-[24px]">
                <NewsThumbnail src={news.thumbnailUrl} />
              </div>
              <div className="flex flex-1 flex-col gap-2 px-3 pt-4 pb-2">
                <p className="text-xs font-bold tracking-[0.44px] text-muted-foreground">
                  {formatDate(news.createdAt)}
                </p>
                <h2 className="line-clamp-2 text-lg leading-6 font-bold text-foreground">
                  {news.title}
                </h2>
                <p className="line-clamp-3 text-sm text-muted-foreground">{news.content}</p>
              </div>
              <div className="flex items-center justify-end gap-1 px-2 pb-1">
                <Button
                  variant="ghost"
                  onClick={() => openForm(news)}
                  className="h-9 rounded-full px-3 font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil aria-hidden />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDeleting(news)
                    setDeleteOpen(true)
                  }}
                  className="h-9 rounded-full px-3 font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 aria-hidden />
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </NewsGrid>
      )}

      <NewsFormDialog key={formKey} open={formOpen} onOpenChange={setFormOpen} news={editing} />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus berita ini?"
        description={`"${deleting?.title ?? ''}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        pending={deleteNews.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}

function NewsGrid({ children }: { children: React.ReactNode }) {
  return <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>
}
