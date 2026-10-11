import { rostiApi } from '@/lib/rosti-api'

export function matchCostQueryOptions(orgId: string, matchId: string) {
  return {
    queryKey: ['match-cost', orgId, matchId] as const,
    queryFn: () => rostiApi.getMatchCost(orgId, matchId),
  }
}

export function matchFeesQueryOptions(orgId: string, matchId: string) {
  return {
    queryKey: ['match-fees', orgId, matchId] as const,
    queryFn: () => rostiApi.listFees(orgId, matchId),
  }
}
