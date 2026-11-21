import { useState } from 'react'
import { Hand } from 'lucide-react'

import { cn } from '@/lib/utils'

type NewsThumbnailProps = {
  src: string | null | undefined
  alt?: string
  className?: string
  /** Smaller default artwork (icon only) for small slots like list rows. */
  compact?: boolean
  /** `lazy` for images further down a list; leave out for the main image of a page. */
  loading?: 'lazy' | 'eager'
}

/**
 * Education news thumbnail. When the news has no thumbnail URL, or the image
 * fails to load (deleted file, server down), it shows the default Suara Tangan
 * artwork instead, so it can be reused on the public site too.
 */
export function NewsThumbnail({ src, alt = '', className, compact, loading }: NewsThumbnailProps) {
  // Remembers which URL failed, so a new `src` gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onError={() => setFailedSrc(src)}
        className={cn('size-full bg-muted object-cover', className)}
      />
    )
  }

  return (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      className={cn(
        'relative flex size-full flex-col items-center justify-center gap-2 overflow-hidden bg-muted',
        className,
      )}
    >
      <span aria-hidden className="absolute -top-[15%] -left-[8%] aspect-square w-1/4 rounded-full bg-tint-amber" />
      <span aria-hidden className="absolute -right-[8%] -bottom-[25%] aspect-square w-1/3 rounded-full bg-tint-sky" />
      <span
        aria-hidden
        className={cn(
          'relative flex items-center justify-center rounded-full bg-primary text-primary-foreground drop-shadow-[0_3px_0_var(--color-primary-foreground)]',
          compact ? 'size-7' : 'size-14',
        )}
      >
        <Hand className={compact ? 'size-4' : 'size-7'} />
      </span>
      {!compact && (
        <span className="relative font-heading text-base font-extrabold text-primary-foreground/80">
          Suara Tangan
        </span>
      )}
    </div>
  )
}
