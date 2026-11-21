import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { NewsThumbnail } from '@/components/news-thumbnail'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api/errors'
import { queryKeys, useCreateEducationNews, useUpdateEducationNews } from '@/lib/api/queries'
import type { EducationNews } from '@/lib/api/types'
import { FormDialog } from '@/pages/admin/components/form-dialog'
import { FormField, adminInputClassName } from '@/pages/admin/components/form-field'
import { ImagePicker } from '@/pages/admin/components/image-picker'
import {
  getNewsErrorMessage,
  getNewsFieldErrors,
  type NewsField,
  type NewsFieldErrors,
} from '@/pages/admin/education-news/news-errors'

const MAX_TITLE_LENGTH = 150

/** Form order, to focus the first field with an error. */
const FIELDS: NewsField[] = ['title', 'content', 'thumbnail']

type NewsFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  news: EducationNews | null
}

type Errors = NewsFieldErrors

export function NewsFormDialog({ open, onOpenChange, news }: NewsFormDialogProps) {
  const isEdit = news !== null
  const queryClient = useQueryClient()
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

  /** Shows the messages next to their fields and focuses the first one. */
  function showErrors(next: Errors) {
    setErrors(next)
    const first = FIELDS.find((field) => next[field])
    if (first) document.getElementById(`news-${first}`)?.focus()
  }

  async function handleSubmit() {
    const found = validate()
    showErrors(found)
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
      const fieldErrors = getNewsFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        showErrors(fieldErrors)
        return
      }

      toast.error(getNewsErrorMessage(error, 'Gagal menyimpan berita. Coba lagi.'))
      if (error instanceof ApiError && error.status === 404) {
        // Deleted in the meantime (e.g. by another admin): close the form and refresh the list.
        onOpenChange(false)
        void queryClient.invalidateQueries({ queryKey: queryKeys.educationNews })
      }
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
        error={errors.thumbnail}
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
            onFileChange={(file) => {
              setThumbnail(file)
              // The rejected file is gone, so is its message.
              setErrors((current) => ({ ...current, thumbnail: undefined }))
            }}
            invalid={Boolean(errors.thumbnail)}
            fallback={<NewsThumbnail src={null} />}
          />
        </div>
      </FormField>
    </FormDialog>
  )
}
