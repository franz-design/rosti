import { rostiApi } from '@/lib/rosti-api'

export function fetchSeasonsQueryOptions(organizationId: string) {
  return {
    queryKey: ['seasons', organizationId] as const,
    queryFn: () => rostiApi.listSeasons(organizationId),
  }
}

export function fetchSeasonQueryOptions(organizationId: string, seasonId: string) {
  return {
    queryKey: ['season', organizationId, seasonId] as const,
    queryFn: () => rostiApi.getSeason(organizationId, seasonId),
  }
}
