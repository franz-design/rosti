import { cn } from '@rosti/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
import { hasClubHomeHighlights } from '../../utils/home-award-slots'
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
  if (!data) return null

  const showClub = hasClubHomeHighlights(data.club)
  const showPersonal = data.me.matchesPlayed > 0
  if (!showClub && !showPersonal) return null

  const seasonName = data.season?.name

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-8',
        showClub && showPersonal && 'lg:flex-row lg:items-start lg:gap-6',
      )}
    >
      {showClub ? (
        <section className="min-w-0 space-y-3 lg:w-max lg:max-w-full lg:shrink">
          <SectionHeading
            title={t('home.stats.clubTitle')}
            subtitle={seasonName ?? t('home.stats.noSeason')}
            subtitleTo="/seasons"
          />
          <ClubStatsGrid stats={data} />
        </section>
      ) : null}

      {showPersonal ? (
        <section className={cn('min-w-0 space-y-3', showClub && 'lg:min-w-72 lg:flex-1')}>
          <SectionHeading title={t('home.stats.personalTitle')} />
          <PersonalStatsRow stats={data.me} stacked={showClub} />
        </section>
      ) : null}
    </div>
  )
}
