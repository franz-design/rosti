import { Badge } from '@rosti/ui/components/primitives/badge'
import { useTranslation } from 'react-i18next'
import type { PlayerRow } from './player-row'

interface PlayerRoleBadgeProps {
  row: PlayerRow
}

export function PlayerRoleBadge({ row }: PlayerRoleBadgeProps) {
  const { t } = useTranslation()

  if (row.kind === 'invitation') {
    return <Badge variant="secondary">{t('clubSettings.players.statusInvited')}</Badge>
  }

  return <Badge variant="outline">{t(`clubSettings.players.roles.${row.role}`)}</Badge>
}
