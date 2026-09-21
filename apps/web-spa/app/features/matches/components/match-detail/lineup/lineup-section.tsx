import { useTranslation } from 'react-i18next'
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
        <div className="rounded-lg border p-3">
          <h3 className="mb-2 text-sm font-medium text-team-blue">
            {t('matches.detail.summary.teamBlue')}
          </h3>
          <ul className="space-y-1 text-sm">
            {blue.map((l) => (
              <li key={l.id}>{l.userName}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border p-3">
          <h3 className="mb-2 text-sm font-medium text-primary">
            {t('matches.detail.summary.teamRed')}
          </h3>
          <ul className="space-y-1 text-sm">
            {red.map((l) => (
              <li key={l.id}>{l.userName}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
