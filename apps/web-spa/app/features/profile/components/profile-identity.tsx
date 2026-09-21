import { Avatar, AvatarFallback } from '@rosti/ui/components/primitives/avatar'

interface ProfileIdentityProps {
  displayName: string
  initials: string
  email?: string | null
}

export function ProfileIdentity({ displayName, initials, email }: ProfileIdentityProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg" className="size-16">
        <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-foreground">{displayName}</p>
        <p className="truncate text-sm text-muted-foreground">{email}</p>
      </div>
    </div>
  )
}
