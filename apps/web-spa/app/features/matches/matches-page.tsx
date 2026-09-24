import { Tabs, TabsContent } from '@rosti/ui/components/primitives/tabs'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useTabSearchParam } from '@/common/hooks/use-tab-search-param'
import { useClub } from '@/features/clubs/hooks/club-context'
import { rostiApi, type Match } from '@/lib/rosti-api'
import { MatchCardActions } from './components/match-card-actions'
import { MatchesHeader } from './components/matches-header'
import { MatchesList } from './components/matches-list'
import { DEFAULT_MATCHES_TAB, MATCHES_TABS, MatchesTabsList } from './components/matches-tabs-list'
import { PostponeMatchDialog } from './components/postpone-match-dialog'
import { listPastMatches, listUpcomingMatches } from './utils/match-filters'

export default function MatchesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { activeClub } = useClub()
  const queryClient = useQueryClient()
  const orgId = activeClub?.id
  const [postponeMatch, setPostponeMatch] = useState<Match | null>(null)
  const [listTab, setListTab] = useTabSearchParam(MATCHES_TABS, DEFAULT_MATCHES_TAB)

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', orgId],
    queryFn: () => rostiApi.listMatches(orgId!),
    enabled: !!orgId,
  })

  const upcoming = useMemo(() => listUpcomingMatches(matches), [matches])
  const past = useMemo(() => listPastMatches(matches), [matches])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['matches', orgId] })
  }

  const cancel = useMutation({
    mutationFn: (matchId: string) => rostiApi.cancelMatch(orgId!, matchId),
    onSuccess: () => {
      toast.success(t('matches.cancelSuccess'))
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const postpone = useMutation({
    mutationFn: ({ matchId, startsAt }: { matchId: string; startsAt: Date }) =>
      rostiApi.updateMatch(orgId!, matchId, {
        startsAt: startsAt.toISOString(),
      }),
    onSuccess: () => {
      toast.success(t('matches.postponeSuccess'))
      setPostponeMatch(null)
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const dateLocale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'

  if (!activeClub) {
    return <div className="p-6 text-muted-foreground">{t('matches.selectClub')}</div>
  }

  return (
    <div className="space-y-6">
      <MatchesHeader clubName={activeClub.name} />

      <Tabs value={listTab} onValueChange={setListTab} className="gap-4">
        <MatchesTabsList />

        <TabsContent value="upcoming" className="outline-none">
          <MatchesList
            matches={upcoming}
            isLoading={isLoading}
            dateLocale={dateLocale}
            variant="upcoming"
            emptyAction={{
              label: t('matches.create'),
              onClick: () => navigate('/matches/new'),
            }}
            renderActions={(match) => (
              <MatchCardActions
                match={match}
                onPostpone={setPostponeMatch}
                onCancel={(matchId) => cancel.mutate(matchId)}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="past" className="outline-none">
          <MatchesList
            matches={past}
            isLoading={isLoading}
            dateLocale={dateLocale}
            variant="past"
          />
        </TabsContent>
      </Tabs>

      {postponeMatch ? (
        <PostponeMatchDialog
          open={!!postponeMatch}
          onOpenChange={(open) => {
            if (!open) setPostponeMatch(null)
          }}
          currentStartsAt={postponeMatch.startsAt}
          isPending={postpone.isPending}
          onConfirm={(startsAt) => postpone.mutate({ matchId: postponeMatch.id, startsAt })}
        />
      ) : null}
    </div>
  )
}
