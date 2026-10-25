import { Button } from '@rosti/ui/components/primitives/button'
import { Plus } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { EmptyMatchArt } from '@/features/matches/components/empty-match-art'
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
  showCreateMatch?: boolean
}

export function HomeMatchSection({
  title,
  isLoading,
  match,
  dateLocale,
  variant,
  promptEnterScore,
  showCreateMatch,
}: HomeMatchSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : match ? (
        <div className="flex flex-1 flex-col">
          <MatchCard
            page="home"
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
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center overflow-hidden gap-6">
          <EmptyMatchArt
            name={variant === 'past' ? 'bench' : 'whistle'}
            className="w-full"
            page="home"
          />
          {showCreateMatch ? (
            <Button render={<Link to="/matches/new" />}>
              <Plus className="size-4" />
              {t('matches.create')}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  )
}
