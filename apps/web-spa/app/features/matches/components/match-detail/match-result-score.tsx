import { Button } from '@rosti/ui/components/primitives/button'
import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { Match } from '@/lib/rosti-api'
import { getResultClass, hasMatchScore } from '@/features/matches/utils/match-filters'

interface MatchResultScoreProps {
  match: Match
  canEnterScore: boolean
  onEnterScore: () => void
}

export function MatchResultScore({ match, canEnterScore, onEnterScore }: MatchResultScoreProps) {
  const { t } = useTranslation()
  const recordedScore = hasMatchScore(match)
  const scoreClassName = cn(recordedScore ? getResultClass(match) : undefined)

  return (
    <section className={cn('rounded-xl border px-6 py-8', scoreClassName)}>
      {recordedScore ? (
        <div className="mx-auto grid w-max grid-cols-[auto_auto_auto] items-center justify-items-center gap-x-8 gap-y-2">
          <p className="text-sm font-medium">{t('matches.detail.summary.teamBlue')}</p>
          <span aria-hidden="true" />
          <p className="text-sm font-medium">{t('matches.detail.summary.teamRed')}</p>
          <p className="text-5xl font-semibold tabular-nums sm:text-6xl">{match.blueScore ?? 0}</p>
          <div className="font-logo text-4xl font-semibold">:</div>
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
