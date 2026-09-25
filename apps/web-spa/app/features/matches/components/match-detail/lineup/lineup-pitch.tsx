import { getLineupPositions } from '@/features/matches/utils/lineup-positions'
import { PlayerBubble } from './player-bubble'

interface PitchPlayer {
  userId: string
  userName: string
  image?: string | null
}

interface LineupPitchProps {
  courtSrc: string
  team: 'blue' | 'red'
  players: PitchPlayer[]
  onRemove: (userId: string) => void
}

export function LineupPitch({ courtSrc, team, players, onRemove }: LineupPitchProps) {
  const positions = getLineupPositions(players.length)

  return (
    <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-lg bg-black sm:max-w-[320px]">
      <img src={courtSrc} alt="" className="block h-auto w-full select-none" draggable={false} />
      {players.map((player, index) => {
        const position = positions[index]
        if (!position) return null
        return (
          <button
            key={player.userId}
            type="button"
            onClick={() => onRemove(player.userId)}
            aria-label={player.userName}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            <PlayerBubble name={player.userName} imageUrl={player.image} team={team} />
          </button>
        )
      })}
    </div>
  )
}
