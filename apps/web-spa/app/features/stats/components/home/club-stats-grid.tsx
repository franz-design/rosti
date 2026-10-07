import { CalendarDays } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import type { SeasonHomeStats } from '@/lib/rosti-api'
import { AwardCard } from './award-card'
import { DuoHighlightCard } from './duo-highlight-card'
import { NumberHighlightCard } from './number-highlight-card'

interface ClubStatsGridProps {
  stats?: SeasonHomeStats
}

export function ClubStatsGrid({ stats }: ClubStatsGridProps) {
  const { t } = useTranslation()
  const club = stats?.club

  return (
    <div className="min-w-0 space-y-4">
      <div className="grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,15.5rem),18rem))] justify-center gap-4">
        <AwardCard
          variant="scorer"
          title={t('home.stats.card.title')}
          subtitle={t('home.stats.card.subtitle')}
          statLabel={t('home.stats.goals')}
          player={club?.topScorer ?? null}
          emptyLabel={t('home.stats.card.emptyScorer')}
        />
        <AwardCard
          variant="wins"
          title={t('home.stats.card.winsTitle')}
          subtitle={t('home.stats.card.subtitle')}
          statLabel={t('home.stats.wins')}
          player={club?.mostWins ?? null}
          emptyLabel={t('home.stats.card.emptyWins')}
        />
        <AwardCard
          variant="losses"
          title={t('home.stats.card.lossesTitle')}
          subtitle={t('home.stats.card.subtitle')}
          statLabel={t('home.stats.losses')}
          player={club?.mostLosses ?? null}
          emptyLabel={t('home.stats.card.emptyLosses')}
        />
        {/* Voting for the best player of the last match does not exist yet. */}
        <AwardCard
          variant="elected"
          title={t('home.stats.card.electedTitle')}
          subtitle={t('home.stats.card.electedSubtitle')}
          player={null}
          emptyLabel={t('home.stats.card.emptyElected')}
          showStat={false}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberHighlightCard
          icon={CalendarDays}
          tone="info"
          label={t('home.stats.matchesPlayed')}
          value={club?.matchesPlayed ?? 0}
        />
        <DuoHighlightCard duo={club?.mostPlayedTogether ?? null} />
      </div>
    </div>
  )
}
