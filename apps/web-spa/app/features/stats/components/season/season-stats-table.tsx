import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { SeasonPlayerStat } from '@/lib/rosti-api'

interface SeasonStatsTableProps {
  stats: SeasonPlayerStat[]
}

export function SeasonStatsTable({ stats }: SeasonStatsTableProps) {
  const { t } = useTranslation()

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
              <span className="flex min-w-0 items-center gap-2">
                <PlayerAvatar name={s.userName} imageUrl={s.image} size="sm" />
                <span className="truncate">{s.userName}</span>
              </span>
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
