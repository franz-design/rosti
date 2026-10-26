import { Button } from '@rosti/ui/components/primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@rosti/ui/components/primitives/dropdown-menu'
import { ChevronDown } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import type { Match } from '@/lib/rosti-api'

interface MatchDetailActionsProps {
  status: Match['status']
  disabled?: boolean
  onRename: () => void
  onReopen: () => void
  onMarkPlayed: () => void
  onCancel: () => void
  onDelete?: () => void
}

export function MatchDetailActions({
  status,
  disabled,
  onRename,
  onReopen,
  onMarkPlayed,
  onCancel,
  onDelete,
}: MatchDetailActionsProps) {
  const { t } = useTranslation()
  const showRename = status !== 'cancelled'
  const showReopen = status !== 'scheduled'
  const showMarkPlayed = status !== 'played'
  const showCancel = status !== 'cancelled'
  const showDelete = Boolean(onDelete)
  const hasPrimaryActions = showRename || showReopen || showMarkPlayed
  const hasDestructiveActions = showCancel || showDelete

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={disabled} />}>
        {t('matches.actions')}
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {showRename ? (
          <DropdownMenuItem onClick={onRename}>{t('matches.rename')}</DropdownMenuItem>
        ) : null}
        {showReopen ? (
          <DropdownMenuItem onClick={onReopen}>{t('matches.reopen')}</DropdownMenuItem>
        ) : null}
        {showMarkPlayed ? (
          <DropdownMenuItem onClick={onMarkPlayed}>{t('matches.markPlayed')}</DropdownMenuItem>
        ) : null}
        {hasPrimaryActions && hasDestructiveActions ? <DropdownMenuSeparator /> : null}
        {showCancel ? (
          <DropdownMenuItem variant="destructive" onClick={onCancel}>
            {t('matches.cancel')}
          </DropdownMenuItem>
        ) : null}
        {showDelete ? (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            {t('matches.delete')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
