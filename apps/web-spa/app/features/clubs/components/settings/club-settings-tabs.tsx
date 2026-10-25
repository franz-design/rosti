import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'

export const CLUB_SETTINGS_TABS = [
  'players',
  'invite',
  'matches',
  'notifications',
  'payment',
] as const
export type ClubSettingsTab = (typeof CLUB_SETTINGS_TABS)[number]
export const DEFAULT_CLUB_SETTINGS_TAB: ClubSettingsTab = 'players'

export function ClubSettingsTabsList() {
  const { t } = useTranslation()

  return (
    <TabsList className="no-scrollbar h-auto min-w-0 max-w-full justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-muted p-1">
      <TabsTrigger value="players" className="flex-none px-3">
        {t('clubSettings.tabs.players')}
      </TabsTrigger>
      <TabsTrigger value="invite" className="flex-none px-3">
        {t('clubSettings.tabs.invite')}
      </TabsTrigger>
      <TabsTrigger value="matches" className="flex-none px-3">
        {t('clubSettings.tabs.matches')}
      </TabsTrigger>
      <TabsTrigger value="notifications" className="flex-none px-3">
        {t('clubSettings.tabs.notifications')}
      </TabsTrigger>
      <TabsTrigger value="payment" className="flex-none px-3">
        {t('clubSettings.tabs.payment')}
      </TabsTrigger>
    </TabsList>
  )
}
