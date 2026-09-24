import { CalendarDays, CloudRain, Target, Trophy, type SolarIcon } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import type { SeasonHomeStats } from '@/lib/rosti-api'
import type { HighlightTone } from './highlight-tone'
import { StatTile } from './stat-tile'

interface PersonalStatsRowProps {
  stats?: SeasonHomeStats['me']
}

export function PersonalStatsRow({ stats }: PersonalStatsRowProps) {
  const { t } = useTranslation()

  const tiles: Array<{
    icon: SolarIcon
    tone: HighlightTone
    label: string
    value: number
  }> = [
    {
      icon: CalendarDays,
      tone: 'info',
      label: t('home.stats.matchesPlayed'),
      value: stats?.matchesPlayed ?? 0,
    },
    {
      icon: Target,
      tone: 'primary',
      label: t('home.stats.goals'),
      value: stats?.goals ?? 0,
    },
    {
      icon: Trophy,
      tone: 'success',
      label: t('home.stats.wins'),
      value: stats?.wins ?? 0,
    },
    {
      icon: CloudRain,
      tone: 'destructive',
      label: t('home.stats.losses'),
      value: stats?.losses ?? 0,
    },
  ]

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </div>
  )
}
