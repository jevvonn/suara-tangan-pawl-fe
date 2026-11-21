const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' })

/** "21 November 2026 pukul 23.09" (local time), or "" for an invalid date. */
export function formatDateTime(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : dateTimeFormatter.format(date)
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/** Whole calendar months from `from` to `to`: 31 Jan → 28 Feb is 0, 31 Jan → 3 Mar is 1. */
function monthsBetween(from: Date, to: Date) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth()
  const anniversary = new Date(from)
  anniversary.setMonth(from.getMonth() + months)
  if (anniversary > to) months--
  return months
}

/**
 * How long ago `iso` was, in Indonesian: "baru saja", "5 menit lalu", "10 jam lalu",
 * "1 hari lalu", "2 minggu lalu", "3 bulan lalu", "1 tahun lalu".
 * A time in the future (e.g. the device clock runs behind the server) reads as
 * "baru saja"; an invalid date returns "".
 */
export function formatRelativeTime(iso: string, now: Date | number = Date.now()) {
  const date = new Date(iso)
  const current = new Date(now)
  const elapsed = current.getTime() - date.getTime()
  if (Number.isNaN(elapsed)) return ''

  if (elapsed < MINUTE) return 'baru saja'
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} menit lalu`
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} jam lalu`
  if (elapsed < WEEK) return `${Math.floor(elapsed / DAY)} hari lalu`

  const months = monthsBetween(date, current)
  if (months < 1) return `${Math.floor(elapsed / WEEK)} minggu lalu`
  if (months < 12) return `${months} bulan lalu`
  return `${Math.floor(months / 12)} tahun lalu`
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}
