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

export interface SeasonWindow {
  startsAt: Date
  endsAt: Date
  /** Label like `2025-2026` for season names spanning two calendar years. */
  label: string
}

/**
 * Default European sports season: 1 September → 30 June.
 * Uses the current season when one is running, otherwise the upcoming one.
 */
export function defaultSeasonWindow(today: Date = new Date()): SeasonWindow {
  const year = today.getFullYear()
  const month = today.getMonth()
  // Jan–June: current season started previous September.
  // July–December: season starting / started this September.
  const seasonStartYear = month <= 5 ? year - 1 : year
  const startsAt = new Date(seasonStartYear, 8, 1)
  const endsAt = new Date(seasonStartYear + 1, 5, 30)
  return {
    startsAt,
    endsAt,
    label: `${seasonStartYear}-${seasonStartYear + 1}`,
  }
}

/** End of the local calendar day, so evening kickoffs on the last day are included. */
export function endOfCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function seasonWindowLabel(startsAt: Date, endsAt: Date): string {
  const startYear = startsAt.getFullYear()
  const endYear = endsAt.getFullYear()
  return startYear === endYear ? String(startYear) : `${startYear}-${endYear}`
}

/**
 * Keeps the first match date inside the season window.
 * When the date falls before the start, jumps to the same weekday on or after season start.
 */
export function clampMatchDateToSeason(
  matchDate: Date,
  seasonStartsAt: Date,
  seasonEndsAt: Date,
): Date {
  const day = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate())
  const start = new Date(
    seasonStartsAt.getFullYear(),
    seasonStartsAt.getMonth(),
    seasonStartsAt.getDate(),
  )
  const end = new Date(seasonEndsAt.getFullYear(), seasonEndsAt.getMonth(), seasonEndsAt.getDate())

  if (day.getTime() > end.getTime()) {
    return new Date(end.getFullYear(), end.getMonth(), end.getDate())
  }
  if (day.getTime() >= start.getTime()) {
    return day
  }

  const weekday = day.getDay()
  const candidate = new Date(start)
  const delta = (weekday - candidate.getDay() + 7) % 7
  candidate.setDate(candidate.getDate() + delta)
  if (candidate.getTime() > end.getTime()) {
    return new Date(end.getFullYear(), end.getMonth(), end.getDate())
  }
  return candidate
}

export function isMatchDateOutsideSeason(
  matchDate: Date,
  seasonStartsAt: Date,
  seasonEndsAt: Date,
): boolean {
  const day = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate()).getTime()
  const start = new Date(
    seasonStartsAt.getFullYear(),
    seasonStartsAt.getMonth(),
    seasonStartsAt.getDate(),
  ).getTime()
  const end = new Date(
    seasonEndsAt.getFullYear(),
    seasonEndsAt.getMonth(),
    seasonEndsAt.getDate(),
  ).getTime()
  return day < start || day > end
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
