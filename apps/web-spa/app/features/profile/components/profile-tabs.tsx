import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'
import { HorizontalPan } from '@/common/components/horizontal-pan'

export const PROFILE_TABS = ['info', 'stats', 'skills', 'notifications'] as const
export type ProfileTab = (typeof PROFILE_TABS)[number]
export const DEFAULT_PROFILE_TAB: ProfileTab = 'info'

export function ProfileTabsList() {
  const { t } = useTranslation()

  return (
    <HorizontalPan className="rounded-lg border border-border bg-muted">
      <TabsList className="h-auto w-max justify-start gap-1 bg-transparent p-1">
        <TabsTrigger value="info" className="flex-none px-3">
          {t('profile.tabs.info')}
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex-none px-3">
          {t('profile.tabs.stats')}
        </TabsTrigger>
        <TabsTrigger value="skills" className="flex-none px-3">
          {t('profile.tabs.skills')}
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex-none px-3">
          {t('profile.tabs.notifications')}
        </TabsTrigger>
      </TabsList>
    </HorizontalPan>
  )
}
