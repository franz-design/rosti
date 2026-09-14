import { Button } from '@rosti/ui/components/primitives/button'
import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import MatchCard from '@/features/matches/match-card'
import { getLastMatch, getNextMatch } from '@/features/matches/match-filters'
import { rostiApi } from '@/lib/rosti-api'
import { useClub } from './club-context'

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
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">{t('home.eyebrow')}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {activeClub?.name ?? t('home.fallbackClub')}
        </h1>
        {activeClub?.venue ? (
          <p className="mt-2 flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {activeClub.venue}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('home.lastMatch')}</h2>
          {isMatchesLoading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : lastMatch ? (
            <MatchCard match={lastMatch} dateLocale={dateLocale} variant="past" />
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <p className="text-muted-foreground">{t('home.noPast')}</p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('home.nextMatch')}</h2>
          {isMatchesLoading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : nextMatch ? (
            <MatchCard match={nextMatch} dateLocale={dateLocale} variant="upcoming" />
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center space-y-3">
              <p className="text-muted-foreground">{t('home.noUpcoming')}</p>
              <Button variant="outline" render={<Link to="/matches" />}>
                {t('home.goToMatches')}
              </Button>
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" render={<Link to="/matches" />}>
          {t('home.allMatches')}
        </Button>
        {isClubAdmin ? (
          <Button variant="outline" render={<Link to="/club-settings" />}>
            {t('nav.clubSettings')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
