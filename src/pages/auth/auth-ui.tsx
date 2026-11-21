import { useState, type ComponentProps, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type AuthCardProps = {
  title: string
  /** Word shown in the amber pill, like "Lebih Mudah" on the landing page. */
  highlight: string
  description: string
  footer: ReactNode
  children: ReactNode
}

export function AuthCard({ title, highlight, description, footer, children }: AuthCardProps) {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-heading text-[32px] leading-10 font-extrabold text-foreground sm:text-[40px] sm:leading-[52px]">
            {title}
            <span className="rounded-[16px] bg-primary px-3 py-0.5 text-background shadow-md">
              {highlight}
            </span>
          </h1>
          <p className="text-base font-medium text-muted-foreground sm:text-lg">{description}</p>
        </div>

        <div className="relative w-full rounded-[48px] bg-card p-6 sm:p-8">
          {/* Shadow layer starts 16px below the top edge, like the demo card */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-4 bottom-0 rounded-[48px] shadow-xl"
          />
          <div className="relative">{children}</div>
        </div>

        <p className="text-sm text-muted-foreground">{footer}</p>
      </div>
    </section>
  )
}

type AuthFieldProps = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

export function AuthField({ id, label, error, children }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export const authInputClassName =
  'h-12 rounded-[48px] border-0 bg-muted px-5 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 md:text-base aria-invalid:ring-2 aria-invalid:ring-destructive/40'

export function PasswordInput({ className, ...props }: ComponentProps<'input'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn(authInputClassName, 'pr-12', className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        aria-pressed={visible}
        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
      >
        {visible ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
      </button>
    </div>
  )
}
