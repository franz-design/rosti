import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { Attendance } from '@/lib/rosti-api'
import { getPlayerFirstName } from '@/features/matches/utils/lineup-positions'

type TeamSide = 'blue' | 'red'

interface AvailablePlayersListProps {
  players: Attendance[]
  otherSide: TeamSide
  draft: Record<string, TeamSide>
  onAssign: (userId: string) => void
}

export function AvailablePlayersList({
  players,
  otherSide,
  draft,
  onAssign,
}: AvailablePlayersListProps) {
  const { t } = useTranslation()

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t('matches.detail.lineupEditor.available')}
      </h3>
      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('matches.detail.lineupEditor.empty')}</p>
      ) : (
        <ul className="space-y-1">
          {players.map((player) => {
            const isOnOtherTeam = draft[player.userId] === otherSide
            return (
              <li key={player.userId}>
                <button
                  type="button"
                  onClick={() => onAssign(player.userId)}
                  className="flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left hover:bg-muted"
                >
                  <PlayerAvatar
                    name={player.userName}
                    imageUrl={player.image}
                    size="sm"
                    fallbackClassName={cn(
                      'text-[10px] font-semibold text-white',
                      isOnOtherTeam ? 'bg-muted-foreground' : 'bg-primary',
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {getPlayerFirstName(player.userName)}
                    </span>
                    {isOnOtherTeam ? (
                      <span className="text-xs text-muted-foreground">
                        {t('matches.detail.lineupEditor.otherTeam')}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
