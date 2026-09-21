import { cn } from '@rosti/ui/lib/utils'
import type { Attendance } from '@/lib/rosti-api'
import type { PlayerStatDraft } from '../player-stat-draft'
import { StatValue } from './stat-value'

interface AttendanceGroupProps {
  title: string
  players: Attendance[]
  emptyLabel: string
  statsByUserId?: Record<string, PlayerStatDraft>
  goalsLabel?: string
  assistsLabel?: string
}

export function AttendanceGroup({
  title,
  players,
  emptyLabel,
  statsByUserId,
  goalsLabel,
  assistsLabel,
}: AttendanceGroupProps) {
  const showStats = statsByUserId != null

  return (
    <section className="space-y-2">
      <h2 className="text-base font-medium">
        {title} <span className="text-muted-foreground">({players.length})</span>
      </h2>
      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          {showStats ? (
            <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_4.5rem] gap-2 border-b bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span />
              <span className="text-center">{goalsLabel}</span>
              <span className="text-center">{assistsLabel}</span>
            </div>
          ) : null}
          <ul className="divide-y">
            {players.map((player) => {
              const playerStats = statsByUserId?.[player.userId]
              return (
                <li
                  key={player.id}
                  className={cn(
                    'px-3 py-2 text-sm',
                    showStats && 'grid grid-cols-[minmax(0,1fr)_3.5rem_4.5rem] items-center gap-2',
                  )}
                >
                  <span className="truncate">{player.userName}</span>
                  {showStats ? (
                    <>
                      <StatValue label={goalsLabel ?? ''} value={playerStats?.goals ?? 0} />
                      <StatValue label={assistsLabel ?? ''} value={playerStats?.assists ?? 0} />
                    </>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
