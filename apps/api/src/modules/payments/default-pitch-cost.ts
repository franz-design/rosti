import { MatchStatus } from '../matches/contracts/match.contract'

export interface DefaultPitchCostCandidate {
  status: MatchStatus
  startsAt: Date
  feesNotifiedAt?: Date | null
}

/** Upcoming scheduled matches still waiting for their payment request. */
export function shouldApplyDefaultPitchCost(
  candidate: DefaultPitchCostCandidate,
  now: Date,
): boolean {
  if (candidate.status !== MatchStatus.Scheduled) return false
  if (candidate.feesNotifiedAt) return false
  return candidate.startsAt.getTime() > now.getTime()
}
