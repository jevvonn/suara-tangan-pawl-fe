import { FeatureLinks } from '@/pages/landing/feature-links'
import { SignDemoCard } from '@/pages/landing/sign-demo-card'

export function LandingPage() {
  return (
    <>
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-[880px] flex-col items-center gap-6 sm:px-8">
          <h1 className="flex flex-wrap items-center justify-center gap-x-[15px] gap-y-2 text-center font-heading text-[32px] leading-[40px] font-extrabold text-foreground sm:text-[48px] sm:leading-[60px] lg:flex-nowrap lg:whitespace-nowrap">
            Belajar Bahasa Isyarat
            <span className="rounded-[16px] bg-primary px-3 py-1 text-background shadow-md">
              Lebih Mudah
            </span>
          </h1>
          <p className="max-w-[576px] text-center text-lg font-medium text-muted-foreground">
            Ketik kata atau kalimat apa saja untuk langsung melihat peragaan{' '}
            <br className="hidden sm:block" />
            visual isyarat tangan secara instan.
          </p>
          <SignDemoCard />
        </div>
      </section>

      <section aria-label="Fitur belajar" className="px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-[880px] sm:px-8">
          <FeatureLinks />
        </div>
      </section>
    </>
  )
}
