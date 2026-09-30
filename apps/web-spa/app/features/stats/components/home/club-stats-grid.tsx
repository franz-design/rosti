import { CalendarDays, CloudRain, Target, Trophy } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import type { SeasonHomeStats } from '@/lib/rosti-api'
import { DuoHighlightCard } from './duo-highlight-card'
import { NumberHighlightCard } from './number-highlight-card'
import { PlayerHighlightCard } from './player-highlight-card'
import { TopScorerCard } from './top-scorer-card'

interface ClubStatsGridProps {
  stats?: SeasonHomeStats
}

export function ClubStatsGrid({ stats }: ClubStatsGridProps) {
  const { t } = useTranslation()
  const club = stats?.club
  const topScorer = club?.topScorer ?? null

  const matchesCard = (
    <NumberHighlightCard
      icon={CalendarDays}
      tone="info"
      label={t('home.stats.matchesPlayed')}
      value={club?.matchesPlayed ?? 0}
    />
  )
  const winsCard = (
    <PlayerHighlightCard
      icon={Trophy}
      tone="success"
      label={t('home.stats.mostWins')}
      player={club?.mostWins ?? null}
      unit={t('home.stats.wins')}
      empty={t('home.stats.emptyWins')}
    />
  )
  const lossesCard = (
    <PlayerHighlightCard
      icon={CloudRain}
      tone="destructive"
      label={t('home.stats.mostLosses')}
      player={club?.mostLosses ?? null}
      unit={t('home.stats.losses')}
      empty={t('home.stats.emptyLosses')}
    />
  )

  if (topScorer) {
    return (
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <TopScorerCard player={topScorer} className="w-full max-w-80 shrink-0 lg:w-80" />
        <div className="grid w-full min-w-0 flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matchesCard}
          {winsCard}
          {lossesCard}
          <DuoHighlightCard
            duo={club?.mostPlayedTogether ?? null}
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {matchesCard}
      <PlayerHighlightCard
        icon={Target}
        tone="primary"
        label={t('home.stats.topScorer')}
        player={null}
        unit={t('home.stats.goals')}
        empty={t('home.stats.emptyScorer')}
      />
      {winsCard}
      {lossesCard}
      <DuoHighlightCard
        duo={club?.mostPlayedTogether ?? null}
        className="sm:col-span-2 xl:col-span-4"
      />
    </div>
  )
}
