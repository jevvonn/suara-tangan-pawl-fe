import { Link } from 'react-router'

import arrowRightIcon from '@/assets/landing/icon-arrow-right.svg'
import bookIcon from '@/assets/landing/icon-book.svg'
import quizIcon from '@/assets/landing/icon-quiz.svg'

const features = [
  {
    to: '/kamus',
    title: 'Kamus Isyarat (A - Z)',
    lines: ['Pelajari abjad, angka, dan gestur', 'kata dasar BISINDO & SIBI.'],
    icon: bookIcon,
    iconBg: 'bg-tint-sky',
  },
  {
    to: '/kuis',
    title: 'Kuis Latihan',
    lines: ['Uji ingatan dan tebak bentuk tangan', 'secara interaktif.'],
    icon: quizIcon,
    iconBg: 'bg-tint-amber',
  },
]

export function FeatureLinks() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {features.map((feature) => (
        <Link
          key={feature.to}
          to={feature.to}
          className="group flex items-center gap-4 rounded-[48px] bg-card p-6 drop-shadow-[0_1px_1px_rgb(0_0_0/0.05)] transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span
            className={`flex size-14 shrink-0 items-center justify-center rounded-[16px] ${feature.iconBg}`}
          >
            <img src={feature.icon} alt="" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl font-bold text-foreground">
              {feature.title}
            </span>
            <span className="text-sm text-muted-foreground">
              {feature.lines[0]} <br className="hidden lg:block" />
              {feature.lines[1]}
            </span>
          </span>
          <img
            src={arrowRightIcon}
            alt=""
            className="shrink-0 transition-transform group-hover:translate-x-1"
          />
        </Link>
      ))}
    </div>
  )
}
