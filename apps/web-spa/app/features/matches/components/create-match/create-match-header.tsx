import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface CreateMatchHeaderProps {
  clubName: string
}

export function CreateMatchHeader({ clubName }: CreateMatchHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link to="/matches" />}>
        ← {t('createMatch.back')}
      </Button>
      <h1 className="text-2xl font-black tracking-tight">{t('createMatch.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('createMatch.subtitle', { club: clubName })}
      </p>
    </div>
  )
}
