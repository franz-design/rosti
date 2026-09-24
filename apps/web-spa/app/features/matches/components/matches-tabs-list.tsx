import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'

export const MATCHES_TABS = ['upcoming', 'past'] as const
export type MatchesTab = (typeof MATCHES_TABS)[number]
export const DEFAULT_MATCHES_TAB: MatchesTab = 'upcoming'

export function MatchesTabsList() {
  const { t } = useTranslation()

  return (
    <TabsList className="h-9 w-fit justify-start gap-1 rounded-lg border border-border bg-muted p-1">
      <TabsTrigger value="upcoming" className="px-3">
        {t('matches.tabs.upcoming')}
      </TabsTrigger>
      <TabsTrigger value="past" className="px-3">
        {t('matches.tabs.past')}
      </TabsTrigger>
    </TabsList>
  )
}
