import { Tabs, TabsContent } from '@rosti/ui/components/primitives/tabs'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { cn } from '@rosti/ui/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useClub } from '@/features/clubs/hooks/club-context'
import { useFullBleedShell } from '@/features/dashboard/hooks/app-shell-context'
import { authClient } from '@/lib/auth-client'
import { rostiApi } from '@/lib/rosti-api'
import { AttendanceTab } from './components/match-detail/attendance/attendance-tab'
import { ChatTab } from './components/match-detail/chat/chat-tab'
import { LineupDialog } from './components/match-detail/lineup/lineup-dialog'
import { MatchDetailHeader } from './components/match-detail/match-detail-header'
import { MatchDetailTabsList } from './components/match-detail/match-detail-tabs-list'
import type { PlayerStatDraft } from './components/match-detail/player-stat-draft'
import { StatsTab } from './components/match-detail/stats/stats-tab'
import { SummaryTab } from './components/match-detail/summary-tab'
import { extractMentionIds, toPlainMentionBody } from './utils/chat-mentions'
import { shouldPromptEnterScore, shouldShowMatchResult } from './utils/match-filters'

type MatchTab = 'summary' | 'attendance' | 'chat' | 'stats'

function playerStatsMatch(
  left: Record<string, PlayerStatDraft>,
  right: Record<string, PlayerStatDraft>,
  userIds: string[],
) {
  return userIds.every(
    (id) =>
      (left[id]?.goals ?? 0) === (right[id]?.goals ?? 0) &&
      (left[id]?.assists ?? 0) === (right[id]?.assists ?? 0),
  )
}

export default function MatchDetailPage() {
  const { matchId } = useParams()
  const { t, i18n } = useTranslation()
  const { activeClub, isClubAdmin } = useClub()
  const orgId = activeClub?.id
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const [tab, setTab] = useState<MatchTab>('summary')
  const [message, setMessage] = useState('')
  const [statDrafts, setStatDrafts] = useState<Record<string, PlayerStatDraft>>({})
  const [scoreDraft, setScoreDraft] = useState({ blue: 0, red: 0 })
  const savingScore = useRef<{ blue: number; red: number } | null>(null)
  const scoreSyncedForMatch = useRef<string | null>(null)
  const pendingStatSave = useRef<Record<string, PlayerStatDraft> | null>(null)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)
  const [isLineupOpen, setIsLineupOpen] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const dateLocale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'
  const isChat = tab === 'chat'

  useFullBleedShell(isChat)

  const enabled = !!orgId && !!matchId

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', orgId, matchId],
    queryFn: () => rostiApi.getMatch(orgId!, matchId!),
    enabled,
  })

  const { data: attendances = [] } = useQuery({
    queryKey: ['attendances', orgId, matchId],
    queryFn: () => rostiApi.listAttendances(orgId!, matchId!),
    enabled,
  })

  const { data: lineups = [] } = useQuery({
    queryKey: ['lineups', orgId, matchId],
    queryFn: () => rostiApi.listLineups(orgId!, matchId!),
    enabled,
  })

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', orgId, matchId],
    queryFn: () => rostiApi.listMessages(orgId!, matchId!),
    enabled,
  })

  const { data: stats = [] } = useQuery({
    queryKey: ['match-stats', orgId, matchId],
    queryFn: () => rostiApi.listMatchStats(orgId!, matchId!),
    enabled,
  })

  const myAttendance = useMemo(
    () => attendances.find((a) => a.userId === session?.user?.id),
    [attendances, session?.user?.id],
  )

  const presentPlayers = useMemo(
    () => attendances.filter((a) => a.status === 'present'),
    [attendances],
  )

  const attendanceGroups = useMemo(
    () => ({
      present: attendances.filter((a) => a.status === 'present'),
      pending: attendances.filter((a) => a.status === 'pending'),
      absent: attendances.filter((a) => a.status === 'absent'),
    }),
    [attendances],
  )

  useEffect(() => {
    const next: Record<string, PlayerStatDraft> = {}
    for (const player of presentPlayers) {
      const existing = stats.find((s) => s.userId === player.userId)
      next[player.userId] = {
        goals: existing?.goals ?? 0,
        assists: existing?.assists ?? 0,
      }
    }
    const userIds = presentPlayers.map((player) => player.userId)
    setStatDrafts((current) => {
      const pending = pendingStatSave.current
      if (!pending) return next
      if (playerStatsMatch(current, pending, userIds) && playerStatsMatch(next, pending, userIds)) {
        pendingStatSave.current = null
        return next
      }
      const merged = { ...next }
      for (const id of userIds) {
        if (current[id]) merged[id] = current[id]
      }
      return merged
    })
  }, [presentPlayers, stats])

  const loadedMatchId = match?.id
  const matchBlueScore = match?.blueScore
  const matchRedScore = match?.redScore

  useEffect(() => {
    if (!loadedMatchId) return
    const server = { blue: matchBlueScore ?? 0, red: matchRedScore ?? 0 }
    if (scoreSyncedForMatch.current !== loadedMatchId) {
      scoreSyncedForMatch.current = loadedMatchId
      savingScore.current = null
      setScoreDraft(server)
      return
    }
    setScoreDraft((current) => {
      if (current.blue === server.blue && current.red === server.red) {
        savingScore.current = null
        return current
      }
      const saving = savingScore.current
      if (
        saving &&
        saving.blue === server.blue &&
        saving.red === server.red &&
        current.blue === saving.blue &&
        current.red === saving.red
      ) {
        savingScore.current = null
        return server
      }
      return current
    })
  }, [loadedMatchId, matchBlueScore, matchRedScore])

  useEffect(() => {
    if (!isChat) return
    const conversation = chatScrollRef.current
    if (!conversation) return
    conversation.scrollTop = conversation.scrollHeight
  }, [messages, isChat])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['attendances', orgId, matchId] })
    void queryClient.invalidateQueries({ queryKey: ['match', orgId, matchId] })
    void queryClient.invalidateQueries({ queryKey: ['matches', orgId] })
    void queryClient.invalidateQueries({ queryKey: ['lineups', orgId, matchId] })
    void queryClient.invalidateQueries({ queryKey: ['messages', orgId, matchId] })
    void queryClient.invalidateQueries({ queryKey: ['match-stats', orgId, matchId] })
  }

  const rsvp = useMutation({
    mutationFn: (status: 'present' | 'absent') =>
      rostiApi.respondAttendance(orgId!, matchId!, status),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  })

  const cancel = useMutation({
    mutationFn: () => rostiApi.cancelMatch(orgId!, matchId!),
    onSuccess: () => {
      toast.success(t('matches.cancelSuccess'))
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const saveLineup = useMutation({
    mutationFn: (assignments: Array<{ userId: string; team: 'blue' | 'red' }>) =>
      rostiApi.setLineup(orgId!, matchId!, assignments),
    onSuccess: () => {
      toast.success(t('matches.detail.lineupEditor.saved'))
      setIsLineupOpen(false)
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const setAttendance = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string
      status: 'present' | 'absent' | 'pending'
    }) => rostiApi.setAttendance(orgId!, matchId!, userId, status),
    onMutate: ({ userId }) => setBusyUserId(userId),
    onSettled: () => setBusyUserId(null),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  })

  const sortedAttendances = useMemo(
    () =>
      [...attendances].sort((a, b) =>
        a.userName.localeCompare(b.userName, dateLocale, { sensitivity: 'base' }),
      ),
    [attendances, dateLocale],
  )

  const postMsg = useMutation({
    mutationFn: () => {
      const markup = message.trim()
      return rostiApi.postMessage(
        orgId!,
        matchId!,
        toPlainMentionBody(markup),
        extractMentionIds(markup),
      )
    },
    onSuccess: () => {
      setMessage('')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const saveStats = useMutation({
    mutationFn: (entries: Array<{ userId: string; goals: number; assists: number }>) =>
      rostiApi.upsertMatchStats(orgId!, matchId!, entries),
    onSuccess: () => {
      toast.success(t('matches.detail.stats.saved'))
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const saveScore = useMutation({
    mutationFn: (score: { blue: number; red: number }) => {
      savingScore.current = score
      return rostiApi.updateMatch(orgId!, matchId!, {
        blueScore: score.blue,
        redScore: score.red,
      })
    },
    onSuccess: () => {
      toast.success(t('matches.detail.stats.scoreSaved'))
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading || !match) {
    return <div className="text-muted-foreground">{t('matches.detail.loading')}</div>
  }

  const startsAt = new Date(match.startsAt)
  const dateLabel = startsAt.toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeLabel = startsAt.toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const canRsvp = match.status === 'scheduled'
  const canManageComposition = isClubAdmin && match.status !== 'cancelled'
  const showMatchResult = shouldShowMatchResult(match)

  return (
    <div className={cn('flex flex-col', isChat && 'min-h-0 flex-1')}>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as MatchTab)}
        className={cn('w-full min-h-0 flex-col gap-0', isChat && 'flex-1')}
      >
        <div className={cn('shrink-0 space-y-4', isChat && 'border-b px-6 pt-6 pb-3')}>
          <MatchDetailHeader match={match} onCancel={() => cancel.mutate()} />
          <MatchDetailTabsList />
        </div>

        <TabsContent
          value="summary"
          className={cn('mt-6 space-y-6 outline-none', isChat && 'px-6')}
        >
          <SummaryTab
            match={match}
            dateLabel={dateLabel}
            timeLabel={timeLabel}
            showMatchResult={showMatchResult}
            canEnterScore={shouldPromptEnterScore(match, isClubAdmin)}
            onEnterScore={() => setTab('stats')}
            canRsvp={canRsvp}
            myAttendance={myAttendance}
            isRsvpPending={rsvp.isPending}
            onPresent={() => rsvp.mutate('present')}
            onAbsent={() => rsvp.mutate('absent')}
            presentPlayers={presentPlayers}
            statDrafts={statDrafts}
            lineups={lineups}
            canManageComposition={canManageComposition}
            onEditLineup={() => setIsLineupOpen(true)}
          />
        </TabsContent>

        <TabsContent
          value="attendance"
          className={cn('mt-6 space-y-6 outline-none', isChat && 'px-6')}
        >
          <AttendanceTab
            canManage={canManageComposition}
            sortedAttendances={sortedAttendances}
            attendanceGroups={attendanceGroups}
            busyUserId={busyUserId}
            onSetStatus={(userId, status) => setAttendance.mutate({ userId, status })}
          />
        </TabsContent>

        <TabsContent value="chat" className="flex min-h-0 flex-1 flex-col outline-none">
          <ChatTab
            messages={messages}
            currentUserId={session?.user?.id}
            scrollRef={chatScrollRef}
            draft={message}
            onDraftChange={setMessage}
            onSubmit={() => postMsg.mutate()}
            isPending={postMsg.isPending}
          />
        </TabsContent>

        <TabsContent value="stats" className={cn('mt-6 space-y-6 outline-none', isChat && 'px-6')}>
          <StatsTab
            score={scoreDraft}
            onScoreChange={setScoreDraft}
            onSaveScore={(next) => {
              if (next.blue === (match.blueScore ?? 0) && next.red === (match.redScore ?? 0)) return
              saveScore.mutate(next)
            }}
            players={presentPlayers}
            drafts={statDrafts}
            onStatChange={(userId, draft) =>
              setStatDrafts((prev) => ({ ...prev, [userId]: draft }))
            }
            onSaveStats={(next) => {
              const userIds = presentPlayers.map((player) => player.userId)
              const server: Record<string, PlayerStatDraft> = {}
              for (const player of presentPlayers) {
                const existing = stats.find((item) => item.userId === player.userId)
                server[player.userId] = {
                  goals: existing?.goals ?? 0,
                  assists: existing?.assists ?? 0,
                }
              }
              if (playerStatsMatch(next, server, userIds)) {
                pendingStatSave.current = null
                return
              }
              pendingStatSave.current = next
              saveStats.mutate(
                presentPlayers.map((player) => ({
                  userId: player.userId,
                  goals: next[player.userId]?.goals ?? 0,
                  assists: next[player.userId]?.assists ?? 0,
                })),
              )
            }}
            canManage={canManageComposition}
          />
        </TabsContent>
      </Tabs>
      <LineupDialog
        open={isLineupOpen}
        onOpenChange={setIsLineupOpen}
        presentPlayers={presentPlayers}
        lineups={lineups}
        sportType={activeClub?.sportType}
        isPending={saveLineup.isPending}
        onSave={(assignments) => saveLineup.mutate(assignments)}
      />
    </div>
  )
}
