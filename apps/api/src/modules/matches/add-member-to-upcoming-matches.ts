import type { EntityManager } from '@mikro-orm/core'
import { User } from '../auth/entities/user.entity'
import { AttendanceStatus, MatchStatus } from './contracts/match.contract'
import { MatchAttendance } from './match-attendance.entity'
import { Match } from './match.entity'

export interface UpcomingMatchCandidate {
  id: string
  status: MatchStatus
  startsAt: Date
}

/**
 * Scheduled matches that have not started, and that this player has not already answered.
 */
export function selectUpcomingMatchIds(input: {
  matches: UpcomingMatchCandidate[]
  attendedMatchIds: ReadonlySet<string>
  now: Date
}): string[] {
  const now = input.now.getTime()
  return input.matches
    .filter((match) => match.status === MatchStatus.Scheduled)
    .filter((match) => match.startsAt.getTime() > now)
    .filter((match) => !input.attendedMatchIds.has(match.id))
    .map((match) => match.id)
}

/**
 * Puts a new club member on every match that is still to be played, as pending.
 * An answer already stored for that player is left unchanged.
 */
export async function addMemberToUpcomingMatches(
  em: EntityManager,
  input: { organizationId: string; userId: string; now?: Date },
): Promise<void> {
  const now = input.now ?? new Date()
  const matches = await em.find(Match, { organization: { id: input.organizationId } })
  const candidateIds = selectUpcomingMatchIds({
    matches,
    attendedMatchIds: new Set(),
    now,
  })
  if (candidateIds.length === 0) return

  const existing = await em.find(MatchAttendance, {
    user: { id: input.userId },
    match: { id: { $in: candidateIds } },
  })
  const matchIds = selectUpcomingMatchIds({
    matches,
    attendedMatchIds: new Set(existing.map((row) => row.match.id)),
    now,
  })
  if (matchIds.length === 0) return

  for (const matchId of matchIds) {
    const attendance = new MatchAttendance()
    attendance.match = em.getReference(Match, matchId)
    attendance.user = em.getReference(User, input.userId)
    attendance.status = AttendanceStatus.Pending
    em.persist(attendance)
  }
  await em.flush()
}
