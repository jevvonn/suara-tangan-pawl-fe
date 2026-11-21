import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import { splitLinks, toParagraphs } from '@/pages/education/news-utils'

/**
 * Plain-text news content (never HTML): blank lines become paragraphs, single
 * line breaks are kept, and http(s) URLs become links that open in a new tab.
 */
export function NewsContent({ content, className }: { content: string; className?: string }) {
  const paragraphs = useMemo(
    () => toParagraphs(content).map((paragraph) => splitLinks(paragraph)),
    [content],
  )

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {paragraphs.map((parts, i) => (
        <p key={i} className="whitespace-pre-line wrap-anywhere">
          {parts.map((part, j) =>
            part.href ? (
              <a
                key={j}
                href={part.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm font-semibold text-primary-foreground underline decoration-primary decoration-2 underline-offset-4 outline-none hover:decoration-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {part.text}
              </a>
            ) : (
              part.text
            ),
          )}
        </p>
      ))}
    </div>
  )
}
