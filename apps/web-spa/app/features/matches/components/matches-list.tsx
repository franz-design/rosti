import { EmptyState } from '@rosti/ui/components/app'
import { CalendarDays } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { Match } from '@/lib/rosti-api'
import MatchCard from './match-card'

interface MatchesListProps {
  matches: Match[]
  isLoading: boolean
  dateLocale: string
  variant: 'upcoming' | 'past'
  emptyAction?: {
    label: string
    onClick: () => void
  }
  renderActions?: (match: Match) => ReactNode
}

export function MatchesList({
  matches,
  isLoading,
  dateLocale,
  variant,
  emptyAction,
  renderActions,
}: MatchesListProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t('matches.loading')}</p>
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-6 text-muted-foreground" />}
        title={variant === 'upcoming' ? t('matches.emptyTitle') : t('matches.emptyPastTitle')}
        description={
          variant === 'upcoming'
            ? t('matches.emptyDescription')
            : t('matches.emptyPastDescription')
        }
        action={emptyAction}
      />
    )
  }

  return (
    <ul className="grid gap-3">
      {matches.map((match) => (
        <li key={match.id}>
          <MatchCard
            match={match}
            dateLocale={dateLocale}
            variant={variant}
            actions={renderActions?.(match)}
          />
        </li>
      ))}
    </ul>
  )
}
