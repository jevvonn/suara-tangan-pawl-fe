import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api/errors'
import { queryKeys, useCreateLetter, useUpdateLetter } from '@/lib/api/queries'
import type { Letter } from '@/lib/api/types'
import { FormDialog } from '@/pages/admin/components/form-dialog'
import { FormField, adminInputClassName } from '@/pages/admin/components/form-field'
import { ImagePicker } from '@/pages/admin/components/image-picker'
import {
  getLetterErrorMessage,
  getLetterFieldErrors,
  type LetterFieldErrors,
} from '@/pages/admin/letters/letter-errors'

const MAX_SYMBOL_LENGTH = 3

type LetterFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The letter being edited, or null when adding a new one. */
  letter: Letter | null
}

type Errors = LetterFieldErrors

export function LetterFormDialog({ open, onOpenChange, letter }: LetterFormDialogProps) {
  const isEdit = letter !== null
  const queryClient = useQueryClient()
  const createLetter = useCreateLetter()
  const updateLetter = useUpdateLetter()
  const pending = createLetter.isPending || updateLetter.isPending

  const [symbol, setSymbol] = useState(letter?.symbol ?? '')
  const [image, setImage] = useState<File | null | undefined>(undefined)
  const [errors, setErrors] = useState<Errors>({})

  function validate(): Errors {
    const next: Errors = {}
    const trimmed = symbol.trim()
    if (!trimmed) next.symbol = 'Huruf, angka, atau simbol wajib diisi.'
    else if (trimmed.length > MAX_SYMBOL_LENGTH)
      next.symbol = `Maksimal ${MAX_SYMBOL_LENGTH} karakter.`
    if (!isEdit && !image) next.image = 'Gambar isyarat wajib diunggah.'
    return next
  }

  async function handleSubmit() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const input = { symbol, image: image ?? undefined }
    try {
      if (isEdit) {
        const saved = await updateLetter.mutateAsync({ id: letter.id, input })
        toast.success(`"${saved.symbol}" berhasil diperbarui.`)
      } else {
        const saved = await createLetter.mutateAsync(input)
        toast.success(`"${saved.symbol}" berhasil ditambahkan.`)
      }
      onOpenChange(false)
    } catch (error) {
      const fieldErrors = getLetterFieldErrors(error, symbol)
      if (fieldErrors.symbol || fieldErrors.image) {
        setErrors(fieldErrors)
        return
      }
      toast.error(getLetterErrorMessage(error))
      if (error instanceof ApiError && error.status === 404) {
        // Someone else already deleted it: close and show the current list.
        onOpenChange(false)
        void queryClient.invalidateQueries({ queryKey: queryKeys.letters })
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Edit "${letter.symbol}"` : 'Tambah Letter'}
      description="Masukkan huruf, angka, atau simbol beserta gambar isyaratnya."
      pending={pending}
      onSubmit={handleSubmit}
    >
      <FormField
        id="letter-symbol"
        label="Huruf / Angka / Simbol"
        hint={`Contoh: A, 7, atau ?. Maksimal ${MAX_SYMBOL_LENGTH} karakter.`}
        error={errors.symbol}
      >
        <Input
          id="letter-symbol"
          value={symbol}
          maxLength={MAX_SYMBOL_LENGTH}
          autoComplete="off"
          autoFocus
          onChange={(event) => {
            setSymbol(event.target.value)
            setErrors((e) => ({ ...e, symbol: undefined }))
          }}
          aria-invalid={Boolean(errors.symbol) || undefined}
          aria-describedby={errors.symbol ? 'letter-symbol-error' : 'letter-symbol-hint'}
          className={`${adminInputClassName} font-display text-lg font-bold uppercase md:text-lg`}
        />
      </FormField>

      <FormField id="letter-image" label="Gambar isyarat" error={errors.image}>
        <div className="mx-auto w-full max-w-[280px]">
          <ImagePicker
            id="letter-image"
            currentUrl={letter?.imageUrl}
            file={image}
            onFileChange={(file) => {
              setImage(file)
              setErrors((e) => ({ ...e, image: undefined }))
            }}
            invalid={Boolean(errors.image)}
          />
        </div>
      </FormField>
    </FormDialog>
  )
}
