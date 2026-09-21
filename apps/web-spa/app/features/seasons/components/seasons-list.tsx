import { EmptyState } from '@rosti/ui/components/app'
import { CalendarRange } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Season } from '@/lib/rosti-api'
import { sortSeasons } from '../utils/season-dates'
import { SeasonCard } from './season-card'

interface SeasonsListProps {
  seasons: Season[]
  isLoading: boolean
  dateLocale: string
  canManage: boolean
  pendingSeasonId?: string
  onCreate: () => void
  onEdit: (season: Season) => void
  onToggleStatus: (season: Season) => void
}

export function SeasonsList({
  seasons,
  isLoading,
  dateLocale,
  canManage,
  pendingSeasonId,
  onCreate,
  onEdit,
  onToggleStatus,
}: SeasonsListProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t('seasons.loading')}</p>
  }

  if (seasons.length === 0) {
    return (
      <EmptyState
        icon={<CalendarRange className="size-6 text-muted-foreground" />}
        title={t('seasons.emptyTitle')}
        description={t('seasons.emptyDescription')}
        action={canManage ? { label: t('seasons.create'), onClick: onCreate } : undefined}
      />
    )
  }

  return (
    <ul className="grid gap-3">
      {sortSeasons(seasons).map((season) => (
        <li key={season.id}>
          <SeasonCard
            season={season}
            dateLocale={dateLocale}
            canManage={canManage}
            isPending={pendingSeasonId === season.id}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        </li>
      ))}
    </ul>
  )
}
