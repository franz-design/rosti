import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'

export function ClubSettingsTabsList() {
  const { t } = useTranslation()

  return (
    <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-muted p-1">
      <TabsTrigger value="players" className="flex-none px-3">
        {t('clubSettings.tabs.players')}
      </TabsTrigger>
      <TabsTrigger value="invite" className="flex-none px-3">
        {t('clubSettings.tabs.invite')}
      </TabsTrigger>
      <TabsTrigger value="seasons" className="flex-none px-3">
        {t('clubSettings.tabs.seasons')}
      </TabsTrigger>
      <TabsTrigger value="payment" className="flex-none px-3">
        {t('clubSettings.tabs.payment')}
      </TabsTrigger>
    </TabsList>
  )
}
