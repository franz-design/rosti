import type { Season } from '@/lib/rosti-api'

export interface SeasonFormValues {
  name: string
  startsAt: Date
  endsAt: Date | null
}

export function parseCalendarDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

export function toCalendarDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatCalendarDate(value: string, locale: string): string {
  return parseCalendarDate(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + days)
  return next
}

export function isCalendarEndBeforeStart(startsAt: Date, endsAt: Date | null): boolean {
  if (!endsAt) return false
  const start = new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate())
  const end = new Date(endsAt.getFullYear(), endsAt.getMonth(), endsAt.getDate())
  return end.getTime() < start.getTime()
}

export function suggestedSeasonStart(activeEndsAt: string | null | undefined, today: Date): Date {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!activeEndsAt) return startOfToday
  const next = addCalendarDays(parseCalendarDate(activeEndsAt), 1)
  return next.getTime() > startOfToday.getTime() ? next : startOfToday
}

export function sortSeasons(seasons: Season[]): Season[] {
  return [...seasons].sort((left, right) => {
    if (left.status !== right.status) return left.status === 'active' ? -1 : 1
    return right.startsAt.localeCompare(left.startsAt)
  })
}

export function seasonToFormValues(season: Season): SeasonFormValues {
  return {
    name: season.name,
    startsAt: parseCalendarDate(season.startsAt),
    endsAt: season.endsAt ? parseCalendarDate(season.endsAt) : null,
  }
}
