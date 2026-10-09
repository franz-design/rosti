import { QuestionCircleIcon } from '@solar-icons/react/bold/question-circle'
import { DislikeIcon } from '@solar-icons/react/bold/dislike'
import { LikeIcon } from '@solar-icons/react/bold/like'
import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { Attendance } from '@/lib/rosti-api'
import type { PlayerStatDraft } from '../player-stat-draft'
import { ToggleChip } from './toggle-chip'
import { cn } from '@rosti/ui/lib/utils'

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
              className={cn(
                'flex flex-wrap gap-3 p-2 lg:p-3 items-center justify-between',
                player.status === 'absent' && 'opacity-50',
              )}
            >
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2">
                <PlayerAvatar name={player.userName} imageUrl={player.image} size="lg" />
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
                  icon={<LikeIcon className="size-5" aria-hidden />}
                />
                <ToggleChip
                  active={player.status === 'absent'}
                  disabled={busy}
                  onClick={() => onSetStatus(player.userId, 'absent')}
                  label={t('matches.detail.attendance.markAbsent')}
                  icon={<DislikeIcon className="size-5" aria-hidden />}
                />
                <ToggleChip
                  active={player.status === 'pending'}
                  disabled={busy}
                  onClick={() => onSetStatus(player.userId, 'pending')}
                  label={t('matches.detail.attendance.markPending')}
                  icon={<QuestionCircleIcon className="size-5" aria-hidden />}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
