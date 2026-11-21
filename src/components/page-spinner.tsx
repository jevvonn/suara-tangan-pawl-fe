import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

type PageSpinnerProps = {
  /** Fill the whole viewport (for pages without the site layout). */
  fullScreen?: boolean
}

export function PageSpinner({ fullScreen = false }: PageSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Memuat"
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'min-h-svh bg-background' : 'py-24',
      )}
    >
      <Loader2 aria-hidden className="size-6 animate-spin text-primary" />
    </div>
  )
}
