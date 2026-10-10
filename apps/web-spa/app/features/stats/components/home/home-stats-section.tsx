import { cn } from '@rosti/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useClub } from '@/features/clubs/hooks/club-context'
import { authClient } from '@/lib/auth-client'
import { hasClubHomeHighlights } from '../../utils/home-award-slots'
import { fetchHomeStatsQueryOptions } from '../../utils/stats-queries'
import { ClubStatsGrid } from './club-stats-grid'
import { HomeStatsSkeleton } from './home-stats-skeleton'
import { PersonalStatsRow } from './personal-stats-row'
import { SectionHeading } from './section-heading'

export default function HomeStatsSection() {
  const { t } = useTranslation()
  const { activeClub } = useClub()
  const { data: session } = authClient.useSession()
  const myUserId = session?.user?.id
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
          <div className="flex items-end justify-between gap-3">
            <SectionHeading title={t('home.stats.personalTitle')} />
            {myUserId ? (
              <Link
                to={`/players/${myUserId}`}
                state={{ from: '/dashboard' }}
                className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {t('playerDetail.open')}
              </Link>
            ) : null}
          </div>
          <PersonalStatsRow stats={data.me} stacked={showClub} />
        </section>
      ) : null}
    </div>
  )
}
