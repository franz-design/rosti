import { EmptyState } from '@rosti/ui/components/app'
import { Button } from '@rosti/ui/components/primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rosti/ui/components/primitives/dropdown-menu'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rosti/ui/components/primitives/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MoreVertical, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useClub } from '@/features/clubs/club-context'
import { rostiApi, type Match } from '@/lib/rosti-api'
import MatchCard from './match-card'
import { listPastMatches, listUpcomingMatches } from './match-filters'
import { PostponeMatchDialog } from './postpone-match-dialog'

type MatchesTab = 'upcoming' | 'past'

export default function MatchesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { activeClub } = useClub()
  const queryClient = useQueryClient()
  const orgId = activeClub?.id
  const [postponeMatch, setPostponeMatch] = useState<Match | null>(null)
  const [listTab, setListTab] = useState<MatchesTab>('upcoming')

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('matches.title')}</h1>
          <p className="text-sm text-muted-foreground">{activeClub.name}</p>
        </div>
        <Button render={<Link to="/matches/new" />}>
          <Plus className="size-4" />
          {t('matches.create')}
        </Button>
      </div>

      <Tabs
        value={listTab}
        onValueChange={(value) => setListTab(value as MatchesTab)}
        className="gap-4"
      >
        <TabsList className="h-9 w-fit justify-start gap-1 rounded-lg border border-border bg-muted p-1">
          <TabsTrigger value="upcoming" className="px-3">
            {t('matches.tabs.upcoming')}
          </TabsTrigger>
          <TabsTrigger value="past" className="px-3">
            {t('matches.tabs.past')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="outline-none">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('matches.loading')}</p>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="size-6 text-muted-foreground" />}
              title={t('matches.emptyTitle')}
              description={t('matches.emptyDescription')}
              action={{
                label: t('matches.create'),
                onClick: () => navigate('/matches/new'),
              }}
            />
          ) : (
            <ul className="grid gap-3">
              {upcoming.map((match) => (
                <li key={match.id}>
                  <MatchCard
                    match={match}
                    dateLocale={dateLocale}
                    variant="upcoming"
                    actions={
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t('matches.menuOpen')}
                            />
                          }
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              setPostponeMatch(match)
                            }}
                          >
                            {t('matches.postpone')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => {
                              e.preventDefault()
                              cancel.mutate(match.id)
                            }}
                          >
                            {t('matches.cancel')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="past" className="outline-none">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('matches.loading')}</p>
          ) : past.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="size-6 text-muted-foreground" />}
              title={t('matches.emptyPastTitle')}
              description={t('matches.emptyPastDescription')}
            />
          ) : (
            <ul className="grid gap-3">
              {past.map((match) => (
                <li key={match.id}>
                  <MatchCard match={match} dateLocale={dateLocale} variant="past" />
                </li>
              ))}
            </ul>
          )}
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
