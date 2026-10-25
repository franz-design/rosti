import { MatchStatus, type RenameMatchScope } from './contracts/match.contract'

export interface RenameMatchCandidate {
  id: string
  organizationId: string
  seasonId: string
  startsAt: Date
  status: MatchStatus
}

export function selectMatchesToRename<T extends RenameMatchCandidate>(input: {
  scope: RenameMatchScope
  sourceId: string
  sourceOrganizationId: string
  sourceSeasonId: string
  sourceStartsAt: Date
  candidates: T[]
}): T[] {
  return input.candidates.filter((candidate) => isMatchIncluded(input, candidate))
}

function isMatchIncluded(
  input: {
    scope: RenameMatchScope
    sourceId: string
    sourceOrganizationId: string
    sourceSeasonId: string
    sourceStartsAt: Date
  },
  candidate: RenameMatchCandidate,
): boolean {
  if (candidate.organizationId !== input.sourceOrganizationId) return false
  if (candidate.seasonId !== input.sourceSeasonId) return false
  if (candidate.status === MatchStatus.Cancelled) return false
  if (input.scope === 'match') return candidate.id === input.sourceId
  if (candidate.id === input.sourceId) return true
  return candidate.startsAt.getTime() > input.sourceStartsAt.getTime()
}
