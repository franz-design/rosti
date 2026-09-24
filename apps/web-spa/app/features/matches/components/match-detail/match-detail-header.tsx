import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getMatchesListHref } from '@/features/matches/utils/match-filters'
import type { Match } from '@/lib/rosti-api'

interface MatchDetailHeaderProps {
  match: Match
  onCancel: () => void
}

export function MatchDetailHeader({ match, onCancel }: MatchDetailHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        render={<Link to={getMatchesListHref(match)} />}
      >
        ← {t('matches.detail.back')}
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{match.title}</h1>
          <p className="text-sm text-muted-foreground">{t(`matches.detail.status.${match.status}`)}</p>
        </div>
        {match.status === 'scheduled' ? (
          <Button variant="destructive" onClick={onCancel}>
            {t('matches.cancel')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
