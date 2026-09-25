import { AvatarGroup } from '@rosti/ui/components/primitives/avatar'
import { UsersRound } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { PlayedTogether } from '@/lib/rosti-api'
import { HighlightLabel } from './highlight-label'
import { HighlightShell } from './highlight-shell'

interface DuoHighlightCardProps {
  duo: PlayedTogether | null
}

export function DuoHighlightCard({ duo }: DuoHighlightCardProps) {
  const { t } = useTranslation()

  return (
    <HighlightShell className="sm:col-span-2 xl:col-span-4">
      <HighlightLabel icon={UsersRound} tone="team" label={t('home.stats.duo')} />
      {duo ? (
        <div className="mt-4 flex min-w-0 items-start gap-3">
          <AvatarGroup className="shrink-0">
            <PlayerAvatar
              name={duo.playerA.userName}
              imageUrl={duo.playerA.image}
              size="lg"
              fallbackClassName="bg-team-blue/15 text-team-blue"
            />
            <PlayerAvatar
              name={duo.playerB.userName}
              imageUrl={duo.playerB.image}
              size="lg"
              fallbackClassName="bg-primary/15 text-primary"
            />
          </AvatarGroup>
          <div className="min-w-0">
            <p className="font-display text-lg font-medium wrap-break-word">
              {t('home.stats.duoNames', {
                playerA: duo.playerA.userName,
                playerB: duo.playerB.userName,
              })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('home.stats.duoCount', { count: duo.matchesTogether })}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">{t('home.stats.emptyDuo')}</p>
      )}
    </HighlightShell>
  )
}
