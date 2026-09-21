import { Button } from '@rosti/ui/components/primitives/button'
import { RefreshCw, Shield, ShieldOff, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PlayerRow } from './player-row'

interface PlayerActionsProps {
  row: PlayerRow
  isBusy: boolean
  onResend: (email: string) => void
  onChangeRole: (memberId: string, role: 'admin' | 'member') => void
  onRemove: (row: PlayerRow) => void
}

export function PlayerActions({
  row,
  isBusy,
  onResend,
  onChangeRole,
  onRemove,
}: PlayerActionsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex shrink-0 flex-wrap justify-end gap-1">
      {row.kind === 'invitation' ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={() => onResend(row.email)}
          aria-label={t('clubSettings.players.resend')}
        >
          <RefreshCw className="size-4" />
          <span className="hidden sm:inline">{t('clubSettings.players.resend')}</span>
        </Button>
      ) : null}
      {row.kind === 'member' && row.canChangeRole ? (
        row.role === 'admin' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => onChangeRole(row.id, 'member')}
            aria-label={t('clubSettings.players.removeAdmin')}
          >
            <ShieldOff className="size-4" />
            <span className="hidden sm:inline">{t('clubSettings.players.removeAdmin')}</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => onChangeRole(row.id, 'admin')}
            aria-label={t('clubSettings.players.makeAdmin')}
          >
            <Shield className="size-4" />
            <span className="hidden sm:inline">{t('clubSettings.players.makeAdmin')}</span>
          </Button>
        )
      ) : null}
      {row.canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isBusy}
          onClick={() => onRemove(row)}
          aria-label={t('clubSettings.players.remove')}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">{t('clubSettings.players.remove')}</span>
        </Button>
      ) : null}
    </div>
  )
}
