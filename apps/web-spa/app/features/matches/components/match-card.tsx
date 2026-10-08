import { cn } from '@rosti/ui/lib/utils'
import {
  CalendarDays,
  Confetti,
  ConfoundedCircle,
  Gps,
  MapPin,
  Users,
  type SolarIcon,
} from '@rosti/ui/icons'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Match } from '@/lib/rosti-api'
import {
  getCardResultClass,
  getResultClass,
  getViewerMatchResult,
  hasMatchScore,
  type ViewerMatchResult,
} from '@/features/matches/utils/match-filters'

const RESULT_ICON: Record<ViewerMatchResult, SolarIcon> = {
  win: Confetti,
  loss: ConfoundedCircle,
  draw: Gps,
}

const RESULT_ICON_CLASS: Record<ViewerMatchResult, string> = {
  win: 'text-success',
  loss: 'text-destructive',
  draw: 'text-muted-foreground',
}

function MatchResultIcon({ result, label }: { result: ViewerMatchResult; label: string }) {
  const Icon = RESULT_ICON[result]
  return <Icon className="size-5 shrink-0" alt={label} />
}

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
  const isCancelled = match.status === 'cancelled'
  const showScore = variant === 'past' && !isCancelled
  const recordedScore = showScore && hasMatchScore(match)
  const viewerResult = showScore ? getViewerMatchResult(match) : undefined
  const resultClass = getCardResultClass(match)
  const cardClassName = cn('rounded-xl border bg-card p-2 shadow-sm overflow-hidden', resultClass)
  const scoreClassName = cn(recordedScore ? getResultClass(match) : undefined)

  const body = (
    <div className="flex items-center justify-between gap-2">
      <div className="space-y-2 min-w-0 p-4">
        <div
          className={cn(
            'flex min-w-0 items-center gap-1.5',
            viewerResult && RESULT_ICON_CLASS[viewerResult],
          )}
        >
          <p className="min-w-0 truncate font-medium text-lg">{match.title}</p>
          {viewerResult ? (
            <MatchResultIcon result={viewerResult} label={t(`matches.result.${viewerResult}`)} />
          ) : null}
        </div>
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
      </div>

      {isCancelled ? (
        <p className="self-start p-4 text-sm text-destructive">
          {t('matches.detail.status.cancelled')}
        </p>
      ) : showScore ? (
        recordedScore ? (
          <div
            className={cn(
              'flex rounded-lg items-center justify-end gap-2 p-4 px-6 self-stretch',
              scoreClassName,
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium">{t('matches.detail.summary.teamBlue')}</span>
              <span className="tabular-nums font-semibold text-3xl sm:text-7xl">
                {match.blueScore}
              </span>
            </div>
            <div className="font-logo text-4xl font-semibold pt-2">:</div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium">{t('matches.detail.summary.teamRed')}</span>
              <span className="tabular-nums font-semibold text-3xl sm:text-7xl">
                {match.redScore}
              </span>
            </div>
          </div>
        ) : promptEnterScore ? (
          <p className="text-sm font-semibold text-primary p-4">{t('matches.enterScore')}</p>
        ) : (
          <p className="text-sm text-muted-foreground p-4">{t('matches.noScore')}</p>
        )
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
        <div className="pointer-events-auto shrink-0 m-2">{actions}</div>
      </div>
    </div>
  )
}
