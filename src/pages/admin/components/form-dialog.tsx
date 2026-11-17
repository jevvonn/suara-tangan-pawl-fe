import type { FormEvent, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  pending: boolean
  onSubmit: () => void
  submitLabel?: string
  className?: string
  children: ReactNode
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  pending,
  onSubmit,
  submitLabel = 'Simpan',
  className,
  children,
}: FormDialogProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        className={cn(
          'max-h-[calc(100svh-2rem)] gap-0 overflow-y-auto rounded-[32px] bg-card p-0 sm:max-w-lg',
          className,
        )}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <DialogHeader className="gap-1 px-6 pt-6 pr-12">
            <DialogTitle className="font-heading text-xl font-extrabold text-foreground">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex flex-col gap-5 px-6 py-5">{children}</div>

          <DialogFooter className="mx-0 mb-0 gap-2 rounded-b-[32px] border-0 bg-transparent px-6 pt-0 pb-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                className="h-10 rounded-full border-0 px-5 font-bold"
              >
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" variant="brand" size="pill" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
