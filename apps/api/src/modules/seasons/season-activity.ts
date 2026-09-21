import { SeasonStatus } from './contracts/season.contract'

export interface ClosableSeason {
  startsAt: Date
  endsAt?: Date | null
}

export interface ClosedSeasonWindow {
  status: SeasonStatus.Closed
  endsAt?: Date
}

/**
 * A club keeps a single active season. Closing fills a missing end date with the
 * day before the season that replaces it, when that day is not before the start.
 */
export function windowAfterClose(season: ClosableSeason, closedEndsAt: Date): ClosedSeasonWindow {
  if (season.endsAt) {
    return { status: SeasonStatus.Closed, endsAt: season.endsAt }
  }
  if (utcDay(closedEndsAt) < utcDay(season.startsAt)) {
    return { status: SeasonStatus.Closed }
  }
  return { status: SeasonStatus.Closed, endsAt: closedEndsAt }
}

export function dayBeforeUtc(date: Date): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  result.setUTCDate(result.getUTCDate() - 1)
  return result
}

export function isEndBeforeStart(startsAt: Date, endsAt?: Date | null): boolean {
  if (!endsAt) return false
  return utcDay(endsAt) < utcDay(startsAt)
}

function utcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}
