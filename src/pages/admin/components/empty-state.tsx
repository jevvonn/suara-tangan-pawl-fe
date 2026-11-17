import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[32px] bg-card px-6 py-14 text-center shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
      <span className="flex size-14 items-center justify-center rounded-[16px] bg-tint-amber text-primary-foreground">
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
