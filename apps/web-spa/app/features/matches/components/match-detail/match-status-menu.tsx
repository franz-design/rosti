import { Button } from '@rosti/ui/components/primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rosti/ui/components/primitives/dropdown-menu'
import { useTranslation } from 'react-i18next'
import type { Match } from '@/lib/rosti-api'

interface MatchStatusMenuProps {
  status: Match['status']
  disabled?: boolean
  onReopen: () => void
  onMarkPlayed: () => void
  onCancel: () => void
}

export function MatchStatusMenu({
  status,
  disabled,
  onReopen,
  onMarkPlayed,
  onCancel,
}: MatchStatusMenuProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" disabled={disabled} />}
      >
        {t('matches.statusMenu')}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {status !== 'scheduled' ? (
          <DropdownMenuItem onClick={onReopen}>{t('matches.reopen')}</DropdownMenuItem>
        ) : null}
        {status !== 'played' ? (
          <DropdownMenuItem onClick={onMarkPlayed}>{t('matches.markPlayed')}</DropdownMenuItem>
        ) : null}
        {status !== 'cancelled' ? (
          <DropdownMenuItem variant="destructive" onClick={onCancel}>
            {t('matches.cancel')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
