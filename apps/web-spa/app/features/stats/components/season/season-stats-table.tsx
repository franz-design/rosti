import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { SeasonPlayerStat } from '@/lib/rosti-api'

interface SeasonStatsTableProps {
  stats: SeasonPlayerStat[]
}

export function SeasonStatsTable({ stats }: SeasonStatsTableProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const from = `${location.pathname}${location.search}`

  return (
    <table className="w-full border text-sm">
      <thead>
        <tr className="border-b bg-muted/40 text-left">
          <th className="p-2">{t('seasonStats.columns.player')}</th>
          <th className="p-2">{t('seasonStats.columns.goals')}</th>
          <th className="p-2">{t('seasonStats.columns.assists')}</th>
          <th className="p-2">{t('seasonStats.columns.matches')}</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((s) => (
          <tr key={s.userId} className="border-b">
            <td className="p-2">
              <Link
                to={`/players/${s.userId}`}
                state={{ from }}
                className="flex min-w-0 items-center gap-2 hover:underline"
              >
                <PlayerAvatar name={s.userName} imageUrl={s.image} size="sm" />
                <span className="truncate">{s.userName}</span>
              </Link>
            </td>
            <td className="p-2">{s.goals}</td>
            <td className="p-2">{s.assists}</td>
            <td className="p-2">{s.matchesPlayed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
