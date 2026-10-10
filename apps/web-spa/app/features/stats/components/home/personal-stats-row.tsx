import { CalendarDays, CloudRain, Target, Trophy, type SolarIcon } from '@rosti/ui/icons'
import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { SeasonHomeStats } from '@/lib/rosti-api'
import { StatTile } from './stat-tile'

interface PersonalStatsRowProps {
  stats?: SeasonHomeStats['me']
  /** Two columns beside the award cards. Four columns when the row has the full width. */
  stacked?: boolean
}

export function PersonalStatsRow({ stats, stacked = false }: PersonalStatsRowProps) {
  const { t } = useTranslation()

  const tiles: Array<{
    icon: SolarIcon
    label: string
    value: number
  }> = [
    {
      icon: CalendarDays,
      label: t('home.stats.matchesPlayed'),
      value: stats?.matchesPlayed ?? 0,
    },
    {
      icon: Target,
      label: t('home.stats.goals'),
      value: stats?.goals ?? 0,
    },
    {
      icon: Trophy,
      label: t('home.stats.wins'),
      value: stats?.wins ?? 0,
    },
    {
      icon: CloudRain,
      label: t('home.stats.losses'),
      value: stats?.losses ?? 0,
    },
  ]

  return (
    <div className={cn('grid min-w-0 grid-cols-2 gap-4', !stacked && 'lg:grid-cols-4')}>
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </div>
  )
}
