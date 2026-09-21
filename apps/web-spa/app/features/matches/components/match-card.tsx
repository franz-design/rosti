import { cn } from '@rosti/ui/lib/utils'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Match } from '@/lib/rosti-api'
import { getViewerMatchResultStripeClass, hasMatchScore } from '@/features/matches/utils/match-filters'

interface MatchCardProps {
  match: Match
  dateLocale: string
  variant: 'upcoming' | 'past'
  actions?: ReactNode
  promptEnterScore?: boolean
}

export default function MatchCard({
  match,
  dateLocale,
  variant,
  actions,
  promptEnterScore = false,
}: MatchCardProps) {
  const { t } = useTranslation()
  const startsAt = new Date(match.startsAt)
  const dateLabel = startsAt.toLocaleString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
  const isFull = (match.presentCount ?? 0) >= match.maxCapacity
  const showScore = variant === 'past'
  const recordedScore = showScore && hasMatchScore(match)
  const cardClassName = cn(
    'rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40',
    recordedScore ? getViewerMatchResultStripeClass(match) : undefined,
  )

  const body = (
    <div className="space-y-2 min-w-0">
      <p className="font-medium text-lg truncate">{match.title}</p>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4 shrink-0" />
        {dateLabel}
      </p>
      {match.location ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {match.location}
        </p>
      ) : null}
      {variant === 'upcoming' ? (
        <p
          className={`flex items-center gap-2 text-sm ${
            isFull ? 'text-success' : 'text-muted-foreground'
          }`}
        >
          <Users className="size-4 shrink-0" />
          {t('matches.capacity', {
            present: match.presentCount ?? 0,
            max: match.maxCapacity,
          })}
        </p>
      ) : null}
      {showScore ? (
        recordedScore ? (
          <p className="flex items-center gap-2 text-sm">
            <span className="font-medium text-team-blue">
              {t('matches.detail.summary.teamBlue')}
            </span>
            <span className="tabular-nums font-semibold">
              {match.blueScore} – {match.redScore}
            </span>
            <span className="font-medium text-primary">{t('matches.detail.summary.teamRed')}</span>
          </p>
        ) : promptEnterScore ? (
          <p className="text-sm font-semibold text-primary">{t('matches.enterScore')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('matches.noScore')}</p>
        )
      ) : null}
      {match.status === 'cancelled' ? (
        <p className="text-sm text-destructive">{t('matches.detail.status.cancelled')}</p>
      ) : null}
    </div>
  )

  if (!actions) {
    return (
      <Link to={`/matches/${match.id}`} className={cn('block', cardClassName)}>
        {body}
      </Link>
    )
  }

  return (
    <div className={cn('relative', cardClassName)}>
      <Link
        to={`/matches/${match.id}`}
        className="absolute inset-0 rounded-xl"
        aria-label={match.title}
      />
      <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
        {body}
        <div className="pointer-events-auto shrink-0">{actions}</div>
      </div>
    </div>
  )
}
