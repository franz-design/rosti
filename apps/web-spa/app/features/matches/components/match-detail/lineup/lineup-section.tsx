import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import { PlayerLink } from '@/common/components/player-link'
import type { Lineup } from '@/lib/rosti-api'

interface LineupSectionProps {
  lineups: Lineup[]
  title?: string
}

export function LineupSection({ lineups, title }: LineupSectionProps) {
  const { t } = useTranslation()
  const blue = lineups.filter((l) => l.team === 'blue')
  const red = lineups.filter((l) => l.team === 'red')

  if (lineups.length === 0) {
    return (
      <section className="space-y-2">
        {title ? <h2 className="text-base font-medium">{title}</h2> : null}
        <p className="text-sm text-muted-foreground">{t('matches.detail.summary.noLineup')}</p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {title ? <h2 className="text-base font-medium">{title}</h2> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-team-blue text-white">
          <div className="border-b border-white/20 p-3 pb-2 flex items-center justify-center">
            <h3 className="mb-2 text-lg font-medium">{t('matches.detail.summary.teamBlue')}</h3>
          </div>
          <ul className="flex flex-wrap gap-6 text-sm p-5">
            {blue.map((l) => (
              <li key={l.id}>
                <PlayerLink userId={l.userId} className="flex items-center gap-2 text-inherit">
                  <PlayerAvatar name={l.userName} imageUrl={l.image} size="lg" />
                  <span className="truncate group-hover:underline">{l.userName}</span>
                </PlayerLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-primary text-white">
          <div className="border-b border-white/20 p-3 pb-2 flex items-center justify-center">
            <h3 className="mb-2 text-lg font-medium">{t('matches.detail.summary.teamRed')}</h3>
          </div>
          <ul className="flex flex-wrap gap-6 text-sm p-5">
            {red.map((l) => (
              <li key={l.id}>
                <PlayerLink userId={l.userId} className="flex items-center gap-2 text-inherit">
                  <PlayerAvatar name={l.userName} imageUrl={l.image} size="lg" />
                  <span className="truncate group-hover:underline">{l.userName}</span>
                </PlayerLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
