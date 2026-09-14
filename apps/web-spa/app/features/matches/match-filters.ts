import type { Match } from '@/lib/rosti-api'

function getStartTime(match: Match): number {
  return new Date(match.startsAt).getTime()
}

/**
 * A scheduled match that has not started yet.
 */
export function isUpcomingMatch(match: Match, now: number = Date.now()): boolean {
  return match.status === 'scheduled' && getStartTime(match) >= now
}

/**
 * A match that already started, was marked played, or was cancelled in the past.
 */
export function isPastMatch(match: Match, now: number = Date.now()): boolean {
  if (match.status === 'played') return true
  return getStartTime(match) < now
}

/**
 * Upcoming matches, soonest first.
 */
export function listUpcomingMatches(matches: Match[], now: number = Date.now()): Match[] {
  return matches
    .filter((match) => isUpcomingMatch(match, now))
    .sort((left, right) => getStartTime(left) - getStartTime(right))
}

/**
 * Past matches, most recent first.
 */
export function listPastMatches(matches: Match[], now: number = Date.now()): Match[] {
  return matches
    .filter((match) => isPastMatch(match, now))
    .sort((left, right) => getStartTime(right) - getStartTime(left))
}

/**
 * Next scheduled match, if any.
 */
export function getNextMatch(matches: Match[], now: number = Date.now()): Match | undefined {
  return listUpcomingMatches(matches, now)[0]
}

/**
 * Most recent past match that was not cancelled.
 */
export function getLastMatch(matches: Match[], now: number = Date.now()): Match | undefined {
  return listPastMatches(matches, now).find((match) => match.status !== 'cancelled')
}

/**
 * True when both team scores have been set (0–0 counts).
 */
export function hasMatchScore(match: Match): boolean {
  return match.blueScore != null && match.redScore != null
}
