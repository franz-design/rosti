import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import MatchCard from '@/features/matches/components/match-card'
import type { Match } from '@/lib/rosti-api'

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
    <section className="space-y-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : match ? (
        <MatchCard
          match={match}
          dateLocale={dateLocale}
          variant={variant}
          promptEnterScore={promptEnterScore}
        />
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-center space-y-3">
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
