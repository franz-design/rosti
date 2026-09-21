import { Button } from '@rosti/ui/components/primitives/button'
import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { Match } from '@/lib/rosti-api'
import {
  getViewerMatchResultStripeClass,
  hasMatchScore,
} from '@/features/matches/utils/match-filters'

interface MatchResultScoreProps {
  match: Match
  canEnterScore: boolean
  onEnterScore: () => void
}

export function MatchResultScore({ match, canEnterScore, onEnterScore }: MatchResultScoreProps) {
  const { t } = useTranslation()
  const recordedScore = hasMatchScore(match)
  const stripeClass = recordedScore ? getViewerMatchResultStripeClass(match) : undefined

  return (
    <section className={cn('rounded-xl border px-6 py-8', stripeClass)}>
      <h2 className="mb-4 text-center text-sm font-medium text-muted-foreground">
        {t('matches.detail.stats.score')}
      </h2>
      {recordedScore ? (
        <div className="mx-auto grid w-max grid-cols-[auto_auto_auto] items-center justify-items-center gap-x-8 gap-y-2">
          <p className="text-sm font-medium text-team-blue">
            {t('matches.detail.summary.teamBlue')}
          </p>
          <span aria-hidden="true" />
          <p className="text-sm font-medium text-primary">
            {t('matches.detail.summary.teamRed')}
          </p>
          <p className="text-5xl font-semibold tabular-nums sm:text-6xl">{match.blueScore ?? 0}</p>
          <span className="text-3xl leading-none text-muted-foreground sm:text-4xl">–</span>
          <p className="text-5xl font-semibold tabular-nums sm:text-6xl">{match.redScore ?? 0}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-medium">{t('matches.noScore')}</p>
          {canEnterScore ? (
            <Button size="sm" onClick={onEnterScore}>
              {t('matches.enterScore')}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  )
}
