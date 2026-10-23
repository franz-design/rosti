import { EmptyState } from '@rosti/ui/components/app'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { Match, SportType } from '@/lib/rosti-api'
import { EmptyMatchArt } from './empty-match-art'
import MatchCard from './match-card'

interface MatchesListProps {
  matches: Match[]
  isLoading: boolean
  dateLocale: string
  variant: 'upcoming' | 'past'
  sportType?: SportType | null
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
  sportType,
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
        illustration={
          <EmptyMatchArt
            name={variant === 'upcoming' ? 'ball' : 'bench'}
            sportType={sportType}
            className={
              variant === 'upcoming' ? 'mx-auto w-full max-w-md' : 'mx-auto w-full max-w-2xl'
            }
          />
        }
        title={variant === 'upcoming' ? t('matches.emptyTitle') : t('matches.emptyPastTitle')}
        description={
          variant === 'upcoming' ? t('matches.emptyDescription') : t('matches.emptyPastDescription')
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
