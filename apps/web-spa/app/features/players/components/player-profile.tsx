import { Badge } from '@rosti/ui/components/primitives/badge'
import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { PlayerDetail } from '@/lib/rosti-api'

interface PlayerProfileProps {
  player: PlayerDetail
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  const { t, i18n } = useTranslation()
  const dateLocale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'
  const memberSince = new Date(player.memberSince).toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const phone = player.phone?.trim()

  return (
    <div className="flex items-center gap-5">
      <PlayerAvatar
        name={player.name}
        imageUrl={player.image}
        className="size-[120px]"
        fallbackClassName="text-3xl font-semibold"
      />
      <div className="min-w-0 space-y-2">
        <div className="space-y-1">
          <h1 className="truncate text-2xl font-black tracking-tight">{player.name}</h1>
          <Badge variant="outline">{t(`clubSettings.players.roles.${player.role}`)}</Badge>
        </div>
        <dl className="space-y-1 text-sm text-muted-foreground">
          <div>
            <dt className="sr-only">{t('playerDetail.email')}</dt>
            <dd className="truncate">{player.email}</dd>
          </div>
          {phone ? (
            <div>
              <dt className="sr-only">{t('playerDetail.phone')}</dt>
              <dd>{phone}</dd>
            </div>
          ) : null}
          <div>
            <dt className="sr-only">{t('playerDetail.memberSinceLabel')}</dt>
            <dd>{t('playerDetail.memberSince', { date: memberSince })}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
