import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'

type FormFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
}

export function FormField({ id, label, hint, error, optional, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
        {optional && <span className="font-medium text-muted-foreground">(opsional)</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

/** Shared input styling for admin forms, matching the landing page input. */
export const adminInputClassName =
  'h-11 rounded-[16px] border-0 bg-muted px-4 text-sm text-foreground focus-visible:ring-primary/50 md:text-sm aria-invalid:ring-2 aria-invalid:ring-destructive/40'
