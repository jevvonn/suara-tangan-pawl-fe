import { useState } from 'react'
import { toast } from 'sonner'

import { NewsThumbnail } from '@/components/news-thumbnail'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessage } from '@/lib/api/errors'
import { useCreateEducationNews, useUpdateEducationNews } from '@/lib/api/queries'
import type { EducationNews } from '@/lib/api/types'
import { FormDialog } from '@/pages/admin/components/form-dialog'
import { FormField, adminInputClassName } from '@/pages/admin/components/form-field'
import { ImagePicker } from '@/pages/admin/components/image-picker'

const MAX_TITLE_LENGTH = 150

type NewsFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  news: EducationNews | null
}

type Errors = { title?: string; content?: string }

export function NewsFormDialog({ open, onOpenChange, news }: NewsFormDialogProps) {
  const isEdit = news !== null
  const createNews = useCreateEducationNews()
  const updateNews = useUpdateEducationNews()
  const pending = createNews.isPending || updateNews.isPending

  const [title, setTitle] = useState(news?.title ?? '')
  const [content, setContent] = useState(news?.content ?? '')
  const [thumbnail, setThumbnail] = useState<File | null | undefined>(undefined)
  const [errors, setErrors] = useState<Errors>({})

  function validate(): Errors {
    const next: Errors = {}
    if (!title.trim()) next.title = 'Judul wajib diisi.'
    else if (title.trim().length > MAX_TITLE_LENGTH)
      next.title = `Judul maksimal ${MAX_TITLE_LENGTH} karakter.`
    if (!content.trim()) next.content = 'Konten wajib diisi.'
    return next
  }

  async function handleSubmit() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    try {
      if (isEdit) {
        await updateNews.mutateAsync({ id: news.id, input: { title, content, thumbnail } })
        toast.success('Berita berhasil diperbarui.')
      } else {
        await createNews.mutateAsync({ title, content, thumbnail: thumbnail ?? null })
        toast.success('Berita berhasil ditambahkan.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const usesDefaultThumbnail = thumbnail === null || (thumbnail === undefined && !news?.thumbnailUrl)

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Education News' : 'Tambah Education News'}
      description="Tulis berita atau materi edukasi seputar bahasa isyarat."
      pending={pending}
      onSubmit={handleSubmit}
      className="sm:max-w-2xl"
    >
      <FormField id="news-title" label="Judul" error={errors.title}>
        <Input
          id="news-title"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(errors.title) || undefined}
          aria-describedby={errors.title ? 'news-title-error' : undefined}
          className={adminInputClassName}
        />
      </FormField>

      <FormField id="news-content" label="Konten" error={errors.content}>
        <Textarea
          id="news-content"
          value={content}
          rows={8}
          onChange={(event) => setContent(event.target.value)}
          aria-invalid={Boolean(errors.content) || undefined}
          aria-describedby={errors.content ? 'news-content-error' : undefined}
          className="min-h-40 rounded-[16px] border-0 bg-muted px-4 py-3 text-sm leading-6 text-foreground focus-visible:ring-primary/50 md:text-sm aria-invalid:ring-2 aria-invalid:ring-destructive/40"
        />
      </FormField>

      <FormField
        id="news-thumbnail"
        label="Thumbnail"
        optional
        hint={
          usesDefaultThumbnail
            ? 'Tanpa thumbnail, berita akan memakai gambar default seperti di atas.'
            : undefined
        }
      >
        <div className="w-full max-w-[360px]">
          <ImagePicker
            id="news-thumbnail"
            aspect="video"
            removable
            currentUrl={news?.thumbnailUrl}
            file={thumbnail}
            onFileChange={setThumbnail}
            fallback={<NewsThumbnail src={null} />}
          />
        </div>
      </FormField>
    </FormDialog>
  )
}
