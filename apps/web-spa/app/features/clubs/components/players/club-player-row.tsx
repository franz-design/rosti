import { PlayerAvatar } from '@/common/components/player-avatar'
import { PlayerActions } from './player-actions'
import { PlayerRoleBadge } from './player-role-badge'
import type { PlayerRow } from './player-row'

interface ClubPlayerRowProps {
  row: PlayerRow
  isBusy: boolean
  onResend: (email: string) => void
  onChangeRole: (memberId: string, role: 'admin' | 'member') => void
  onRemove: (row: PlayerRow) => void
}

export function ClubPlayerRow({
  row,
  isBusy,
  onResend,
  onChangeRole,
  onRemove,
}: ClubPlayerRowProps) {
  return (
    <li className="flex items-start gap-3 p-3">
      <PlayerAvatar name={row.name} imageUrl={row.kind === 'member' ? row.image : null} size="sm" />
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
    </li>
  )
}
