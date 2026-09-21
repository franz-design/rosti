import { Badge } from '@rosti/ui/components/primitives/badge'
import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Season } from '@/lib/rosti-api'
import { formatCalendarDate } from '../utils/season-dates'

interface SeasonCardProps {
  season: Season
  dateLocale: string
  canManage: boolean
  isPending: boolean
  onEdit: (season: Season) => void
  onToggleStatus: (season: Season) => void
}

export function SeasonCard({
  season,
  dateLocale,
  canManage,
  isPending,
  onEdit,
  onToggleStatus,
}: SeasonCardProps) {
  const { t } = useTranslation()
  const isActive = season.status === 'active'
  const start = formatCalendarDate(season.startsAt, dateLocale)
  const range = season.endsAt
    ? t('seasons.rangeClosed', { start, end: formatCalendarDate(season.endsAt, dateLocale) })
    : isActive
      ? t('seasons.rangeOpen', { start })
      : t('seasons.rangeStartOnly', { start })

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-medium">{season.name}</h2>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? t('seasons.statusActive') : t('seasons.statusClosed')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{range}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" render={<Link to={`/seasons/${season.id}/stats`} />}>
            {t('seasons.stats')}
          </Button>
          {canManage ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(season)}
                disabled={isPending}
              >
                {t('seasons.edit')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(season)}
                disabled={isPending}
              >
                {isActive ? t('seasons.close') : t('seasons.reopen')}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  )
}
