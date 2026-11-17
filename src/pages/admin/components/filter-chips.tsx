import { cn } from '@/lib/utils'

type FilterChipsProps<T extends string> = {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

/** Segmented control styled like the landing page header nav. */
export function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-fit flex-wrap items-center gap-1 rounded-full bg-surface-low p-1"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active
                ? 'bg-primary text-primary-foreground drop-shadow-[0_2px_0_var(--color-primary-foreground)]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
