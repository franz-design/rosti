import { CalendarDays, CloudRain, Target, Trophy, Users, type SolarIcon } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { StatTile } from '@/features/stats/components/home/stat-tile'
import type { PlayerDetail } from '@/lib/rosti-api'

interface PlayerSeasonStatsProps {
  season: PlayerDetail['season']
  stats: PlayerDetail['stats']
}

export function PlayerSeasonStats({ season, stats }: PlayerSeasonStatsProps) {
  const { t } = useTranslation()

  const tiles: Array<{
    icon: SolarIcon
    label: string
    value: number
  }> = [
    {
      icon: CalendarDays,
      label: t('home.stats.matchesPlayed'),
      value: stats.matchesPlayed,
    },
    {
      icon: Target,
      label: t('home.stats.goals'),
      value: stats.goals,
    },
    {
      icon: Users,
      label: t('playerDetail.assists'),
      value: stats.assists,
    },
    {
      icon: Trophy,
      label: t('home.stats.wins'),
      value: stats.wins,
    },
    {
      icon: CloudRain,
      label: t('home.stats.losses'),
      value: stats.losses,
    },
  ]

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-medium">{t('playerDetail.statsTitle')}</h2>
        {season ? (
          <Link
            to={`/seasons/${season.id}/stats`}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {season.name}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">{t('playerDetail.noSeason')}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>
    </section>
  )
}
