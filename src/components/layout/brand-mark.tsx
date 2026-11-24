import { cn } from '@/lib/utils'
import brandLogo from '@/assets/landing/brand-logo.png'

type BrandMarkProps = {
  className?: string
  textClassName?: string
  /**
   * 'image' renders the official brand logo graphic (Suara in black, Tangan in orange).
   * 'text' renders semantic HTML text with Suara in foreground and Tangan in primary.
   */
  variant?: 'image' | 'text'
}

export function BrandMark({ className, textClassName, variant = 'image' }: BrandMarkProps) {
  if (variant === 'text') {
    return (
      <span
        className={cn(
          'inline-flex items-center font-heading text-2xl font-extrabold tracking-[-0.03em] whitespace-nowrap select-none',
          className,
          textClassName,
        )}
      >
        <span className="text-foreground">Suara</span>
        <span className="text-primary">Tangan</span>
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center select-none', className)}>
      <img
        src={brandLogo}
        alt="Suara Tangan"
        className={cn('h-8 w-auto object-contain', textClassName)}
      />
    </span>
  )
}
