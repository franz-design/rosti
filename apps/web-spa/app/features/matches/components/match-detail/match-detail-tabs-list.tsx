import { Badge } from '@rosti/ui/components/primitives/badge'
import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'

export const MATCH_DETAIL_TABS = ['summary', 'attendance', 'chat', 'stats'] as const
export type MatchTab = (typeof MATCH_DETAIL_TABS)[number]
export const DEFAULT_MATCH_DETAIL_TAB: MatchTab = 'summary'

interface MatchDetailTabsListProps {
  unreadMessageCount: number
}

export function MatchDetailTabsList({ unreadMessageCount }: MatchDetailTabsListProps) {
  const { t } = useTranslation()

  return (
    <TabsList className="h-9 w-full justify-start gap-1 rounded-lg border border-border bg-muted p-1">
      <TabsTrigger value="summary" className="px-3">
        {t('matches.detail.tabs.summary')}
      </TabsTrigger>
      <TabsTrigger value="attendance" className="px-3">
        {t('matches.detail.tabs.attendance')}
      </TabsTrigger>
      <TabsTrigger value="chat" className="gap-1.5 px-3">
        {t('matches.detail.tabs.chat')}
        {unreadMessageCount > 0 && (
          <Badge className="h-5 min-w-5 px-1.5">{Math.min(unreadMessageCount, 99)}</Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="stats" className="px-3">
        {t('matches.detail.tabs.stats')}
      </TabsTrigger>
    </TabsList>
  )
}
