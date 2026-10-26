import { Badge } from '@rosti/ui/components/primitives/badge'
import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'
import { HorizontalPan } from '@/common/components/horizontal-pan'

export const MATCH_DETAIL_TABS = ['summary', 'chat', 'stats', 'payments'] as const
export type MatchTab = (typeof MATCH_DETAIL_TABS)[number]
export const DEFAULT_MATCH_DETAIL_TAB: MatchTab = 'summary'

interface MatchDetailTabsListProps {
  unreadMessageCount: number
}

export function MatchDetailTabsList({ unreadMessageCount }: MatchDetailTabsListProps) {
  const { t } = useTranslation()

  return (
    <HorizontalPan className="rounded-lg border border-border bg-muted">
      <TabsList className="h-auto w-max justify-start gap-1 bg-transparent p-1">
        <TabsTrigger value="summary" className="flex-none px-3">
          {t('matches.detail.tabs.summary')}
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex-none gap-1.5 px-3">
          {t('matches.detail.tabs.chat')}
          {unreadMessageCount > 0 && (
            <Badge className="h-5 min-w-5 px-1.5">{Math.min(unreadMessageCount, 99)}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex-none px-3">
          {t('matches.detail.tabs.stats')}
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex-none px-3">
          {t('matches.detail.tabs.payments')}
        </TabsTrigger>
      </TabsList>
    </HorizontalPan>
  )
}
