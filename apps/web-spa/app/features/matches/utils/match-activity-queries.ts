import { rostiApi, type MatchActivityArea } from '@/lib/rosti-api'

export function matchActivityQueryOptions(input: {
  orgId: string
  matchId: string
  area: MatchActivityArea
}) {
  return {
    queryKey: ['match-activity', input.orgId, input.matchId, input.area] as const,
    queryFn: () => rostiApi.listMatchActivity(input.orgId, input.matchId, input.area),
    // The list mounts each time the panel opens. Always refetch so recent changes show up.
    staleTime: 0,
  }
}
