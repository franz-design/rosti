import { rostiApi } from '@/lib/rosti-api'

export function fetchHomeStatsQueryOptions(organizationId: string) {
  return {
    queryKey: ['home-stats', organizationId],
    queryFn: () => rostiApi.getHomeStats(organizationId),
  }
}
