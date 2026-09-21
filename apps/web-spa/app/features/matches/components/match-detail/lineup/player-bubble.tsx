import { cn } from '@rosti/ui/lib/utils'
import { getPlayerFirstName, getPlayerInitials } from '@/features/matches/utils/lineup-positions'

interface PlayerBubbleProps {
  name: string
  team: 'blue' | 'red'
}

export function PlayerBubble({ name, team }: PlayerBubbleProps) {
  const firstName = getPlayerFirstName(name)
  const initials = getPlayerInitials(name)

  return (
    <span className="flex flex-col items-center gap-1">
      <span
        className={cn(
          'flex size-12 items-center justify-center rounded-full border-2 text-xs font-semibold text-white shadow-md',
          team === 'blue'
            ? 'border-team-blue-dark bg-team-blue'
            : 'border-primary-dark bg-primary',
        )}
      >
        {initials}
      </span>
      <span className="max-w-16 truncate text-[10px] font-semibold tracking-wide text-white uppercase drop-shadow">
        {firstName}
      </span>
    </span>
  )
}
