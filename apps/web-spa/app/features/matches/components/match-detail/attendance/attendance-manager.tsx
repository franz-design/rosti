import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { Attendance } from '@/lib/rosti-api'
import { ToggleChip } from './toggle-chip'

interface AttendanceManagerProps {
  players: Attendance[]
  busyUserId: string | null
  onSetStatus: (userId: string, status: 'present' | 'absent' | 'pending') => void
}

export function AttendanceManager({ players, busyUserId, onSetStatus }: AttendanceManagerProps) {
  const { t } = useTranslation()

  if (players.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('matches.detail.attendance.empty')}</p>
    )
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('matches.detail.attendance.manageHint')}</p>
      <ul className="divide-y rounded-lg border">
        {players.map((player) => {
          const busy = busyUserId === player.userId
          return (
            <li
              key={player.id}
              className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-2">
                <PlayerAvatar name={player.userName} imageUrl={player.image} size="sm" />
                <p className="truncate text-sm font-medium">{player.userName}</p>
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
