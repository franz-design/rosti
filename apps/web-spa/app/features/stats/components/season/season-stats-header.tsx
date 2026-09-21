import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface SeasonStatsHeaderProps {
  seasonName?: string
}

export function SeasonStatsHeader({ seasonName }: SeasonStatsHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link to="/seasons" />}>
        ← {t('seasonStats.back')}
      </Button>
      <h1 className="text-2xl font-black tracking-tight">
        {seasonName ?? t('seasonStats.title')}
      </h1>
    </div>
  )
}
