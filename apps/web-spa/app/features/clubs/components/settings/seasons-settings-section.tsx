import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function SeasonsSettingsSection() {
  const { t } = useTranslation()

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-medium">{t('clubSettings.seasons.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('clubSettings.seasons.hint')}</p>
      <Button variant="outline" render={<Link to="/seasons" />}>
        {t('clubSettings.seasons.manage')}
      </Button>
    </section>
  )
}
