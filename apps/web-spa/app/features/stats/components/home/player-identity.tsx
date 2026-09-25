import { PlayerAvatar } from '@/common/components/player-avatar'

interface PlayerIdentityProps {
  name: string
  imageUrl?: string | null
}

export function PlayerIdentity({ name, imageUrl }: PlayerIdentityProps) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <PlayerAvatar name={name} imageUrl={imageUrl} />
      <p className="font-display text-base font-medium truncate">{name}</p>
    </div>
  )
}
