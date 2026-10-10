import { rostiApi } from '@/lib/rosti-api'

export function fetchPlayerDetailQueryOptions(organizationId: string, userId: string) {
  return {
    queryKey: ['player-detail', organizationId, userId],
    queryFn: () => rostiApi.getPlayerDetail(organizationId, userId),
  }
}
