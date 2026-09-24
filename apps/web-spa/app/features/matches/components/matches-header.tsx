import { Button } from '@rosti/ui/components/primitives/button'
import { Plus } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface MatchesHeaderProps {
  clubName: string
}

export function MatchesHeader({ clubName }: MatchesHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{t('matches.title')}</h1>
        <p className="text-sm text-muted-foreground">{clubName}</p>
      </div>
      <Button render={<Link to="/matches/new" />}>
        <Plus className="size-4" />
        {t('matches.create')}
      </Button>
    </div>
  )
}
