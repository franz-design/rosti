import { Badge } from '@rosti/ui/components/primitives/badge'
import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'

export const MATCH_DETAIL_TABS = ['summary', 'chat', 'stats', 'payments'] as const
export type MatchTab = (typeof MATCH_DETAIL_TABS)[number]
export const DEFAULT_MATCH_DETAIL_TAB: MatchTab = 'summary'

const triggerClassName = 'min-w-0 flex-1 px-2 sm:px-3'

interface MatchDetailTabsListProps {
  unreadMessageCount: number
}

export function MatchDetailTabsList({ unreadMessageCount }: MatchDetailTabsListProps) {
  const { t } = useTranslation()

  return (
    <TabsList className="h-auto w-full gap-1 border border-border p-1">
      <TabsTrigger value="summary" className={triggerClassName}>
        <span className="truncate">{t('matches.detail.tabs.summary')}</span>
      </TabsTrigger>
      <TabsTrigger value="chat" className={triggerClassName}>
        <span className="truncate">{t('matches.detail.tabs.chat')}</span>
        {unreadMessageCount > 0 && (
          <Badge className="h-5 min-w-5 shrink-0 px-1.5">{Math.min(unreadMessageCount, 99)}</Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="stats" className={triggerClassName}>
        <span className="truncate">{t('matches.detail.tabs.stats')}</span>
      </TabsTrigger>
      <TabsTrigger value="payments" className={triggerClassName}>
        <span className="truncate">{t('matches.detail.tabs.payments')}</span>
      </TabsTrigger>
    </TabsList>
  )
}
