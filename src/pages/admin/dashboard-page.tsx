import { Link } from 'react-router'
import { ArrowRight, Hand, Newspaper, Users, type LucideIcon } from 'lucide-react'

import { NewsThumbnail } from '@/components/news-thumbnail'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/api/errors'
import { useDashboardStats } from '@/lib/api/queries'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/pages/admin/components/page-header'

const cardClassName = 'rounded-[32px] bg-card p-6 shadow-[0_1px_1px_rgb(0_0_0/0.05)]'

export function DashboardPage() {
  const { data, isPending, isError, error } = useDashboardStats()

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan konten dan pengguna Suara Tangan."
      />

      {isError ? (
        <p role="alert" className={cn(cardClassName, 'text-sm text-destructive')}>
          Gagal memuat statistik: {getErrorMessage(error)}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Hand}
            iconClassName="bg-tint-amber text-primary-foreground"
            label="Letters"
            to="/admin/letters"
            value={data?.letters.total}
            detail={
              data &&
              `${data.letters.letters} huruf · ${data.letters.numbers} angka · ${data.letters.symbols} simbol`
            }
          />
          <StatCard
            icon={Users}
            iconClassName="bg-tint-sky text-[#0b5c96]"
            label="Users"
            to="/admin/users"
            value={data?.users.total}
            detail={data && `${data.users.admins} admin · ${data.users.users} user`}
          />
          <StatCard
            icon={Newspaper}
            iconClassName="bg-[rgb(76_175_80/0.18)] text-[#2e6b31]"
            label="Education News"
            to="/admin/education-news"
            value={data?.educationNews.total}
            detail={
              data && `${data.educationNews.withThumbnail} dengan thumbnail khusus`
            }
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cn(cardClassName, 'flex min-w-0 flex-col gap-4')}>
          <SectionTitle title="Letters terbaru" to="/admin/letters" />
          {isPending ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-square rounded-[16px] bg-muted" />
              ))}
            </div>
          ) : data?.recentLetters.length ? (
            <ul className="grid grid-cols-4 gap-2">
              {data.recentLetters.map((letter) => (
                <li
                  key={letter.id}
                  className="relative aspect-square overflow-hidden rounded-[16px] bg-muted"
                >
                  <img
                    src={letter.imageUrl}
                    alt={`Isyarat ${letter.symbol}`}
                    className="size-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-md">
                    {letter.symbol}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada letter.</p>
          )}
        </section>

        <section className={cn(cardClassName, 'flex min-w-0 flex-col gap-4')}>
          <SectionTitle title="Education News terbaru" to="/admin/education-news" />
          {isPending ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-14 rounded-[16px] bg-muted" />
              ))}
            </div>
          ) : data?.recentEducationNews.length ? (
            <ul className="flex flex-col gap-3">
              {data.recentEducationNews.map((news) => (
                <li key={news.id} className="flex items-center gap-3">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-[12px]">
                    <NewsThumbnail src={news.thumbnailUrl} compact />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <p className="truncate text-sm font-bold text-foreground">{news.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(news.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada berita.</p>
          )}
        </section>
      </div>
    </>
  )
}

type StatCardProps = {
  icon: LucideIcon
  iconClassName: string
  label: string
  to: string
  value: number | undefined
  detail: string | false | undefined
}

function StatCard({ icon: Icon, iconClassName, label, to, value, detail }: StatCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        cardClassName,
        'group flex flex-col gap-4 outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50',
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('flex size-14 items-center justify-center rounded-[16px]', iconClassName)}>
          <Icon aria-hidden className="size-6" />
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-muted-foreground">{label}</p>
        {value === undefined ? (
          <Skeleton className="h-11 w-16 rounded-[12px] bg-muted" />
        ) : (
          <p className="font-heading text-[40px] leading-[44px] font-extrabold text-foreground">
            {value}
          </p>
        )}
        {detail ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : (
          <Skeleton className="h-4 w-32 rounded-full bg-muted" />
        )}
      </div>
    </Link>
  )
}

function SectionTitle({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <Link
        to={to}
        className="text-sm font-bold text-primary-foreground underline-offset-4 hover:underline"
      >
        Kelola
      </Link>
    </div>
  )
}
