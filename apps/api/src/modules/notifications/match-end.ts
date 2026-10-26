export const MATCH_DURATION_MINUTE_OPTIONS = [45, 60, 75, 90, 105, 120] as const

export type MatchDurationMinutes = (typeof MATCH_DURATION_MINUTE_OPTIONS)[number]

export const DEFAULT_MATCH_DURATION_MINUTES: MatchDurationMinutes = 90

/** Extra wait after the configured end, so a match that runs long is finished. */
export const MATCH_END_MARGIN_MINUTES = 15

/** How far back the scheduler looks for a match whose end notification was missed. */
export const MATCH_END_CATCH_UP_MS = 6 * 60 * 60 * 1000

const MINUTE_MS = 60 * 1000

export function isMatchDurationMinutes(value: number): value is MatchDurationMinutes {
  return (MATCH_DURATION_MINUTE_OPTIONS as readonly number[]).includes(value)
}

export function readMatchDurationMinutes(value: number | null | undefined): MatchDurationMinutes {
  if (value != null && isMatchDurationMinutes(value)) return value
  return DEFAULT_MATCH_DURATION_MINUTES
}

/**
 * Kickoff plus the club's match length, plus the 15-minute margin.
 */
export function computeMatchEndAt(startsAt: Date, durationMinutes: number): Date {
  const duration = readMatchDurationMinutes(durationMinutes)
  return new Date(startsAt.getTime() + (duration + MATCH_END_MARGIN_MINUTES) * MINUTE_MS)
}

/**
 * True once kickoff + duration + 15 minutes is reached.
 * The exact end instant counts as finished.
 */
export function hasMatchEnded(
  startsAt: Date,
  durationMinutes: number,
  now: Date = new Date(),
): boolean {
  return computeMatchEndAt(startsAt, durationMinutes).getTime() <= now.getTime()
}

/**
 * Score reminders and payment requests go out at kickoff + duration + 15 minutes.
 * A match that already ended is due immediately.
 */
export function computeMatchEndNotificationRunAt(
  startsAt: Date,
  durationMinutes: number,
  now: Date = new Date(),
): Date {
  const dueAt = computeMatchEndAt(startsAt, durationMinutes)
  return dueAt > now ? dueAt : new Date(now.getTime())
}

/**
 * Latest kickoff that can already be finished, using the shortest allowed match.
 * A longer match that started at this time is not finished yet.
 */
export function latestKickoffThatMayHaveEnded(now: Date): Date {
  const shortestMinutes = Math.min(...MATCH_DURATION_MINUTE_OPTIONS)
  return new Date(now.getTime() - (shortestMinutes + MATCH_END_MARGIN_MINUTES) * MINUTE_MS)
}

/**
 * Latest kickoff that is finished for every allowed match length.
 * Anything that started at this time or earlier is played, whatever the club chose.
 */
export function latestKickoffThatHasEnded(now: Date): Date {
  const longestMinutes = Math.max(...MATCH_DURATION_MINUTE_OPTIONS)
  return new Date(now.getTime() - (longestMinutes + MATCH_END_MARGIN_MINUTES) * MINUTE_MS)
}

/**
 * Earliest kickoff that can still be inside the catch-up window,
 * using the longest allowed match.
 */
export function earliestMatchEndKickoff(now: Date): Date {
  const longestMinutes = Math.max(...MATCH_DURATION_MINUTE_OPTIONS)
  const delayMs = (longestMinutes + MATCH_END_MARGIN_MINUTES) * MINUTE_MS
  return new Date(now.getTime() - delayMs - MATCH_END_CATCH_UP_MS)
}
