import { cn } from '@/lib/utils'
import brandLogo from '@/assets/landing/brand-logo.png'

type BrandMarkProps = {
  className?: string
  textClassName?: string
}

export function BrandMark({ className, textClassName }: BrandMarkProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <img src={brandLogo} alt="" className="size-8 object-cover" />
      <span
        className={cn(
          'text-xl font-bold whitespace-nowrap text-foreground',
          textClassName,
        )}
      >
        Suara Tangan
      </span>
    </span>
  )
}
