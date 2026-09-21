import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
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

  const stats = data
  const seasonName = stats?.season?.name

  return (
    <div className="min-w-0 space-y-8">
      <section className="space-y-3">
        <SectionHeading
          title={t('home.stats.clubTitle')}
          subtitle={seasonName ?? t('home.stats.noSeason')}
          subtitleTo="/seasons"
        />
        <ClubStatsGrid stats={stats} />
      </section>

      <section className="space-y-3">
        <SectionHeading title={t('home.stats.personalTitle')} />
        <PersonalStatsRow stats={stats?.me} />
      </section>
    </div>
  )
}
