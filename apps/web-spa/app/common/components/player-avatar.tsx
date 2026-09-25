import { Avatar, AvatarFallback, AvatarImage } from '@rosti/ui/components/primitives/avatar'
import { cn } from '@rosti/ui/lib/utils'
import { getPlayerInitials } from '@/features/matches/utils/lineup-positions'

interface PlayerAvatarProps {
  name: string
  imageUrl?: string | null
  size?: 'sm' | 'default' | 'lg'
  className?: string
  fallbackClassName?: string
}

export function PlayerAvatar({
  name,
  imageUrl,
  size = 'default',
  className,
  fallbackClassName,
}: PlayerAvatarProps) {
  return (
    <Avatar size={size} className={cn('shrink-0', className)}>
      {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
      <AvatarFallback className={fallbackClassName}>{getPlayerInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
