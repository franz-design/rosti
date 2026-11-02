import { Button } from '@rosti/ui/components/primitives/button'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { CalendarDays, Clock, MapPin, Share } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getMatchesListHref } from '@/features/matches/utils/match-filters'
import { buildMatchShareText } from '@/features/matches/utils/build-match-share-text'
import { shareMatchText } from '@/features/matches/utils/share-match-text'
import type { Match } from '@/lib/rosti-api'
import { MatchDetailActions } from './match-detail-actions'

interface MatchDetailHeaderProps {
  match: Match
  presentCount: number
  canManage: boolean
  isStatusPending?: boolean
  onRename: () => void
  onReopen: () => void
  onMarkPlayed: () => void
  onCancel: () => void
  onDelete?: () => void
}

export function MatchDetailHeader({
  match,
  presentCount,
  canManage,
  isStatusPending,
  onRename,
  onReopen,
  onMarkPlayed,
  onCancel,
  onDelete,
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

  const handleShare = async () => {
    const text = buildMatchShareText({
      title: match.title,
      dateLabel,
      timeLabel,
      location,
      capacityLabel: t('matches.capacity', {
        present: presentCount,
        max: match.maxCapacity,
      }),
      url: `${window.location.origin}/matches/${match.id}`,
    })

    try {
      const result = await shareMatchText({ title: match.title, text })
      if (result === 'copied') toast.success(t('matches.detail.share.copied'))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error(t('matches.detail.share.failed'))
    }
  }

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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={() => void handleShare()}>
            <Share />
            {t('matches.detail.share.button')}
          </Button>
          {canManage ? (
            <MatchDetailActions
              status={match.status}
              disabled={isStatusPending}
              onRename={onRename}
              onReopen={onReopen}
              onMarkPlayed={onMarkPlayed}
              onCancel={onCancel}
              onDelete={onDelete}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
