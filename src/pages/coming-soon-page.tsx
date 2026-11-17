import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

type ComingSoonPageProps = {
  title: string
  description?: string
}

export function ComingSoonPage({
  title,
  description = 'Halaman ini sedang kami siapkan. Nantikan segera!',
}: ComingSoonPageProps) {
  return (
    <section className="mx-auto flex max-w-[880px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-8">
      <h1 className="font-heading text-4xl font-extrabold text-foreground">
        {title}
      </h1>
      <p className="text-lg font-medium text-muted-foreground">{description}</p>
      <Button
        asChild
        className="mt-2 h-auto rounded-full border-0 px-5 py-2.5 text-[15px] leading-5 font-bold tracking-[0.15px]"
      >
        <Link to="/">Kembali ke Beranda</Link>
      </Button>
    </section>
  )
}
