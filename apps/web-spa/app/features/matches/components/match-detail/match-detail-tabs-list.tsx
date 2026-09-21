import { TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useTranslation } from 'react-i18next'

export function MatchDetailTabsList() {
  const { t } = useTranslation()

  return (
    <TabsList className="h-9 w-full justify-start gap-1 rounded-lg border border-border bg-muted p-1">
      <TabsTrigger value="summary" className="px-3">
        {t('matches.detail.tabs.summary')}
      </TabsTrigger>
      <TabsTrigger value="attendance" className="px-3">
        {t('matches.detail.tabs.attendance')}
      </TabsTrigger>
      <TabsTrigger value="chat" className="px-3">
        {t('matches.detail.tabs.chat')}
      </TabsTrigger>
      <TabsTrigger value="stats" className="px-3">
        {t('matches.detail.tabs.stats')}
      </TabsTrigger>
    </TabsList>
  )
}
