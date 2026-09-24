import {
  getLastMatch,
  getNextMatch,
  shouldPromptEnterScore,
} from '@/features/matches/utils/match-filters'
import HomeStatsSection from '@/features/stats/components/home/home-stats-section'
import { rostiApi } from '@/lib/rosti-api'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { HomeHeader } from './components/home/home-header'
import { HomeMatchSection } from './components/home/home-match-section'
import { useClub } from './hooks/club-context'

export default function ClubsPage() {
  const { t, i18n } = useTranslation()
  const { clubs, activeClub, isLoading, isClubAdmin } = useClub()

  const { data: matches = [], isLoading: isMatchesLoading } = useQuery({
    queryKey: ['matches', activeClub?.id],
    queryFn: () => rostiApi.listMatches(activeClub!.id),
    enabled: !!activeClub,
  })

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">{t('common.loading')}</div>
  }

  if (clubs.length === 0) {
    return <Navigate to="/onboarding" replace />
  }

  const lastMatch = getLastMatch(matches)
  const nextMatch = getNextMatch(matches)
  const dateLocale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'

  return (
    <div className="min-w-0 space-y-8">
      <HomeHeader clubName={activeClub?.name ?? t('home.fallbackClub')} venue={activeClub?.venue} />

      <div className="grid gap-6 lg:grid-cols-2">
        <HomeMatchSection
          title={t('home.lastMatch')}
          isLoading={isMatchesLoading}
          match={lastMatch}
          dateLocale={dateLocale}
          variant="past"
          emptyLabel={t('home.noPast')}
          promptEnterScore={lastMatch ? shouldPromptEnterScore(lastMatch, isClubAdmin) : undefined}
        />
        <HomeMatchSection
          title={t('home.nextMatch')}
          isLoading={isMatchesLoading}
          match={nextMatch}
          dateLocale={dateLocale}
          variant="upcoming"
          emptyLabel={t('home.noUpcoming')}
          showGoToMatches
        />
      </div>

      <HomeStatsSection />
    </div>
  )
}
