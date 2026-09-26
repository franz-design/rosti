import { useLayoutEffect, useRef } from 'react'
import { PlayerAvatar } from '@/common/components/player-avatar'
import { MemberAvatarControl } from './member-avatar-control'
import { PlayerActions } from './player-actions'
import { PlayerRoleBadge } from './player-role-badge'
import type { PlayerRow } from './player-row'

interface ClubPlayerRowProps {
  row: PlayerRow
  isBusy: boolean
  isAvatarPending: boolean
  onResend: (email: string) => void
  onChangeRole: (memberId: string, role: 'admin' | 'member') => void
  onRemove: (row: PlayerRow) => void
  onChangeAvatar: (memberId: string, userId: string, file: File) => void
  onRemoveAvatar: (memberId: string, userId: string) => void
}

export function ClubPlayerRow({
  row,
  isBusy,
  isAvatarPending,
  onResend,
  onChangeRole,
  onRemove,
  onChangeAvatar,
  onRemoveAvatar,
}: ClubPlayerRowProps) {
  const avatarSlotRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const slot = avatarSlotRef.current
    if (!slot) return

    const syncSize = () => {
      slot.style.width = `${slot.offsetHeight}px`
    }

    syncSize()
    const observer = new ResizeObserver(syncSize)
    observer.observe(slot)
    return () => observer.disconnect()
  }, [])

  return (
    <li className="flex items-stretch gap-3 p-3">
      <div ref={avatarSlotRef} className="relative shrink-0 self-stretch">
        {row.kind === 'member' ? (
          <MemberAvatarControl
            name={row.name}
            imageUrl={row.image}
            isBusy={isBusy}
            isPending={isAvatarPending}
            onSelectFile={(file) => onChangeAvatar(row.id, row.userId, file)}
            onRemove={() => onRemoveAvatar(row.id, row.userId)}
          />
        ) : (
          <PlayerAvatar name={row.name} className="absolute inset-0 size-full! rounded-full" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-medium">{row.name}</p>
          {row.kind === 'member' && row.name !== row.email ? (
            <p className="truncate text-sm text-muted-foreground">{row.email}</p>
          ) : null}
          <div>
            <PlayerRoleBadge row={row} />
          </div>
        </div>
        <PlayerActions
          row={row}
          isBusy={isBusy}
          onResend={onResend}
          onChangeRole={onChangeRole}
          onRemove={onRemove}
        />
      </div>
    </li>
  )
}
