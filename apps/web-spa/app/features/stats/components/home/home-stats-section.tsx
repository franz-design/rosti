import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
import { shouldShowHomeStats } from '../../utils/home-stats-visibility'
import { fetchHomeStatsQueryOptions } from '../../utils/stats-queries'
import { ClubStatsGrid } from './club-stats-grid'
import { HomeStatsSkeleton } from './home-stats-skeleton'
import { PersonalStatsRow } from './personal-stats-row'
import { SectionHeading } from './section-heading'

export default function HomeStatsSection() {
  const { t } = useTranslation()
  const { activeClub } = useClub()
  const organizationId = activeClub?.id
  const { data, isLoading } = useQuery({
    ...fetchHomeStatsQueryOptions(organizationId ?? ''),
    enabled: !!organizationId,
  })

  if (!organizationId) return null
  if (isLoading) return <HomeStatsSkeleton />
  if (!shouldShowHomeStats(data?.club.matchesPlayed ?? 0)) return null

  const seasonName = data?.season?.name

  return (
    <div className="min-w-0 space-y-8">
      <section className="space-y-3">
        <SectionHeading
          title={t('home.stats.clubTitle')}
          subtitle={seasonName ?? t('home.stats.noSeason')}
          subtitleTo="/seasons"
        />
        <ClubStatsGrid stats={data} />
      </section>

      <section className="space-y-3">
        <SectionHeading title={t('home.stats.personalTitle')} />
        <PersonalStatsRow stats={data?.me} />
      </section>
    </div>
  )
}
