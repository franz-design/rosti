import { Avatar, AvatarFallback } from '@rosti/ui/components/primitives/avatar'
import { getPlayerInitials } from '@/features/matches/utils/lineup-positions'

interface PlayerIdentityProps {
  name: string
}

export function PlayerIdentity({ name }: PlayerIdentityProps) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar>
        <AvatarFallback>{getPlayerInitials(name)}</AvatarFallback>
      </Avatar>
      <p className="font-display text-base font-medium truncate">{name}</p>
    </div>
  )
}
