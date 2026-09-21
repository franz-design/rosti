import { MatchStatus } from '../matches/contracts/match.contract'

/** Amateur sessions have no stored duration; 90 minutes after kickoff is "just ended". */
export const SCORE_REMINDER_DELAY_MS = 90 * 60 * 1000

export const CLUB_ADMIN_ROLES = ['owner', 'admin'] as const

export function computeScoreReminderRunAt(startsAt: Date, now: Date = new Date()): Date {
  const endedAt = new Date(startsAt.getTime() + SCORE_REMINDER_DELAY_MS)
  return endedAt > now ? endedAt : new Date(now.getTime())
}

export function canRemindScore(input: {
  status: string
  blueScore?: number | null
  redScore?: number | null
}): boolean {
  if (input.status === MatchStatus.Cancelled) return false
  return input.blueScore == null || input.redScore == null
}
