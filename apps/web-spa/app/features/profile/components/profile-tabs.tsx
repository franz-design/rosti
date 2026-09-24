import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'

export const PROFILE_TABS = ['info', 'notifications'] as const
export type ProfileTab = (typeof PROFILE_TABS)[number]
export const DEFAULT_PROFILE_TAB: ProfileTab = 'info'

export function ProfileTabsList() {
  const { t } = useTranslation()

  return (
    <TabsList className="no-scrollbar h-auto min-w-0 max-w-full justify-start gap-1 overflow-x-auto rounded-lg border border-border bg-muted p-1">
      <TabsTrigger value="info" className="flex-none px-3">
        {t('profile.tabs.info')}
      </TabsTrigger>
      <TabsTrigger value="notifications" className="flex-none px-3">
        {t('profile.tabs.notifications')}
      </TabsTrigger>
    </TabsList>
  )
}
