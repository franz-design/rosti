import { Button } from '@rosti/ui/components/primitives/button'
import { CalendarDays, Clock, MapPin } from '@rosti/ui/icons'
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
  const { t, i18n } = useTranslation()
  const dateLocale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'
  const startsAt = new Date(match.startsAt)
  const dateLabel = startsAt.toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeLabel = startsAt.toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const location = match.location?.trim()

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
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground/80">
            <span className="font-bold text-primary">
              {t(`matches.detail.status.${match.status}`)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4 shrink-0" />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4 shrink-0" />
              {timeLabel}
            </span>
            {location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4 shrink-0" />
                {location}
              </span>
            ) : null}
          </p>
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
