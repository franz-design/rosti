import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getMatchesListHref } from '@/features/matches/utils/match-filters'
import type { Match } from '@/lib/rosti-api'
import { MatchStatusMenu } from './match-status-menu'

interface MatchDetailHeaderProps {
  match: Match
  canManage: boolean
  isStatusPending?: boolean
  onReopen: () => void
  onMarkPlayed: () => void
  onCancel: () => void
}

export function MatchDetailHeader({
  match,
  canManage,
  isStatusPending,
  onReopen,
  onMarkPlayed,
  onCancel,
}: MatchDetailHeaderProps) {
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
        {canManage ? (
          <MatchStatusMenu
            status={match.status}
            disabled={isStatusPending}
            onReopen={onReopen}
            onMarkPlayed={onMarkPlayed}
            onCancel={onCancel}
          />
        ) : null}
      </div>
    </div>
  )
}
