import { MatchStatus } from '../matches/contracts/match.contract'
import { computeMatchEndNotificationRunAt } from './match-end'

export const CLUB_ADMIN_ROLES = ['owner', 'admin'] as const

export function computeScoreReminderRunAt(
  startsAt: Date,
  durationMinutes: number,
  now: Date = new Date(),
): Date {
  return computeMatchEndNotificationRunAt(startsAt, durationMinutes, now)
}

export function canRemindScore(input: {
  status: string
  blueScore?: number | null
  redScore?: number | null
}): boolean {
  if (input.status === MatchStatus.Cancelled) return false
  return input.blueScore == null || input.redScore == null
}
