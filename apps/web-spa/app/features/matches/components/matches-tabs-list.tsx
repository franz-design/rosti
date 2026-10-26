import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'
import { HorizontalPan } from '@/common/components/horizontal-pan'

export const MATCHES_TABS = ['upcoming', 'past'] as const
export type MatchesTab = (typeof MATCHES_TABS)[number]
export const DEFAULT_MATCHES_TAB: MatchesTab = 'upcoming'

export function MatchesTabsList() {
  const { t } = useTranslation()

  return (
    <HorizontalPan className="rounded-lg border border-border bg-muted">
      <TabsList className="h-9 w-max justify-start gap-1 bg-transparent p-1">
        <TabsTrigger value="upcoming" className="flex-none px-3">
          {t('matches.tabs.upcoming')}
        </TabsTrigger>
        <TabsTrigger value="past" className="flex-none px-3">
          {t('matches.tabs.past')}
        </TabsTrigger>
      </TabsList>
    </HorizontalPan>
  )
}
