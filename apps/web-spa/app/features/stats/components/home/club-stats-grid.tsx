import { CalendarDays, CloudRain, Target, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SeasonHomeStats } from '@/lib/rosti-api'
import { DuoHighlightCard } from './duo-highlight-card'
import { NumberHighlightCard } from './number-highlight-card'
import { PlayerHighlightCard } from './player-highlight-card'

interface ClubStatsGridProps {
  stats?: SeasonHomeStats
}

export function ClubStatsGrid({ stats }: ClubStatsGridProps) {
  const { t } = useTranslation()
  const club = stats?.club

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NumberHighlightCard
        icon={CalendarDays}
        tone="info"
        label={t('home.stats.matchesPlayed')}
        value={club?.matchesPlayed ?? 0}
      />
      <PlayerHighlightCard
        icon={Target}
        tone="primary"
        label={t('home.stats.topScorer')}
        player={club?.topScorer ?? null}
        unit={t('home.stats.goals')}
        empty={t('home.stats.emptyScorer')}
      />
      <PlayerHighlightCard
        icon={Trophy}
        tone="success"
        label={t('home.stats.mostWins')}
        player={club?.mostWins ?? null}
        unit={t('home.stats.wins')}
        empty={t('home.stats.emptyWins')}
      />
      <PlayerHighlightCard
        icon={CloudRain}
        tone="destructive"
        label={t('home.stats.mostLosses')}
        player={club?.mostLosses ?? null}
        unit={t('home.stats.losses')}
        empty={t('home.stats.emptyLosses')}
      />
      <DuoHighlightCard duo={club?.mostPlayedTogether ?? null} />
    </div>
  )
}
