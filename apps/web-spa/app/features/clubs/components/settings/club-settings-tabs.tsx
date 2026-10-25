import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'
import { HorizontalPan } from '@/common/components/horizontal-pan'

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
    <HorizontalPan className="rounded-lg border border-border bg-muted p-1">
      <TabsList className="h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
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
    </HorizontalPan>
  )
}
