import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { Attendance } from '@/lib/rosti-api'
import type { PlayerStatDraft } from '../player-stat-draft'
import { ToggleChip } from './toggle-chip'

interface AttendanceManagerProps {
  players: Attendance[]
  busyUserId: string | null
  onSetStatus: (userId: string, status: 'present' | 'absent' | 'pending') => void
  statsByUserId?: Record<string, PlayerStatDraft>
  goalsLabel?: string
  assistsLabel?: string
}

export function AttendanceManager({
  players,
  busyUserId,
  onSetStatus,
  statsByUserId,
  goalsLabel,
  assistsLabel,
}: AttendanceManagerProps) {
  const { t } = useTranslation()

  if (players.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('matches.detail.attendance.empty')}</p>
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('matches.detail.attendance.manageHint')}</p>
      <ul className="divide-y rounded-lg border">
        {players.map((player) => {
          const busy = busyUserId === player.userId
          const playerStats =
            player.status === 'present' ? statsByUserId?.[player.userId] : undefined
          return (
            <li
              key={player.id}
              className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2">
                <PlayerAvatar name={player.userName} imageUrl={player.image} size="sm" />
                <p className="truncate text-sm font-medium">{player.userName}</p>
                {playerStats ? (
                  <p className="col-start-2 mt-1 text-xs text-muted-foreground">
                    {goalsLabel} {playerStats.goals}
                    {' · '}
                    {assistsLabel} {playerStats.assists}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1 sm:justify-end">
                <ToggleChip
                  active={player.status === 'present'}
                  disabled={busy}
                  onClick={() => onSetStatus(player.userId, 'present')}
                  label={t('matches.detail.attendance.markPresent')}
                />
                <ToggleChip
                  active={player.status === 'absent'}
                  disabled={busy}
                  onClick={() => onSetStatus(player.userId, 'absent')}
                  label={t('matches.detail.attendance.markAbsent')}
                />
                <ToggleChip
                  active={player.status === 'pending'}
                  disabled={busy}
                  onClick={() => onSetStatus(player.userId, 'pending')}
                  label={t('matches.detail.attendance.markPending')}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
