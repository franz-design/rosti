import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useClub } from '@/features/clubs/hooks/club-context'
import { rostiApi } from '@/lib/rosti-api'
import { fetchSeasonQueryOptions } from '@/features/seasons/utils/seasons-queries'
import { SeasonStatsHeader } from './components/season/season-stats-header'
import { SeasonStatsTable } from './components/season/season-stats-table'

export default function SeasonStatsPage() {
  const { t } = useTranslation()
  const { seasonId } = useParams()
  const { activeClub } = useClub()
  const organizationId = activeClub?.id

  const { data: season } = useQuery({
    ...fetchSeasonQueryOptions(organizationId ?? '', seasonId ?? ''),
    enabled: !!organizationId && !!seasonId,
  })
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['season-stats', organizationId, seasonId],
    queryFn: () => rostiApi.seasonStats(organizationId!, seasonId!),
    enabled: !!organizationId && !!seasonId,
  })

  return (
    <div className="space-y-6">
      <SeasonStatsHeader seasonName={season?.name} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('seasonStats.loading')}</p>
      ) : null}
      {!isLoading && stats.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('seasonStats.empty')}</p>
      ) : null}
      {stats.length > 0 ? <SeasonStatsTable stats={stats} /> : null}
    </div>
  )
}
