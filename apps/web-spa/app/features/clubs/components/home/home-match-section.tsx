import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import MatchCard from '@/features/matches/components/match-card'
import type { Match } from '@/lib/rosti-api'
import { HomeMatchRsvp } from './home-match-rsvp'

interface HomeMatchSectionProps {
  title: string
  isLoading: boolean
  match?: Match
  dateLocale: string
  variant: 'upcoming' | 'past'
  emptyLabel: string
  promptEnterScore?: boolean
  showGoToMatches?: boolean
}

export function HomeMatchSection({
  title,
  isLoading,
  match,
  dateLocale,
  variant,
  emptyLabel,
  promptEnterScore,
  showGoToMatches,
}: HomeMatchSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : match ? (
        <div className="flex flex-1 flex-col">
          <MatchCard
            className="h-full"
            match={match}
            dateLocale={dateLocale}
            variant={variant}
            promptEnterScore={promptEnterScore}
            footer={
              variant === 'upcoming' && match.status === 'scheduled' ? (
                <HomeMatchRsvp matchId={match.id} />
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
          <p className="text-muted-foreground">{emptyLabel}</p>
          {showGoToMatches ? (
            <Button variant="outline" render={<Link to="/matches" />}>
              {t('home.goToMatches')}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  )
}
