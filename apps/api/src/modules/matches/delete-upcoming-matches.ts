import { MatchStatus } from './contracts/match.contract'

export interface DeletableMatchCandidate {
  id: string
  status: MatchStatus
  startsAt: Date
}

/**
 * Upcoming matches are scheduled and have not started yet.
 * A chosen match is included only when it is still upcoming.
 */
export function selectUpcomingMatchesToDelete<T extends DeletableMatchCandidate>(input: {
  matches: T[]
  now: Date
  matchId?: string
}): T[] {
  const now = input.now.getTime()
  return input.matches.filter((match) => {
    if (input.matchId && match.id !== input.matchId) return false
    return match.status === MatchStatus.Scheduled && match.startsAt.getTime() >= now
  })
}
