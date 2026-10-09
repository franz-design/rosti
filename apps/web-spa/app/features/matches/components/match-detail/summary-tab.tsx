import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { Attendance, Lineup, Match } from '@/lib/rosti-api'
import { AttendanceGroup } from './attendance/attendance-group'
import { AttendanceManager } from './attendance/attendance-manager'
import { LineupSection } from './lineup/lineup-section'
import { MatchResultScore } from './match-result-score'
import { PlayerVotePanel } from './player-vote-panel'
import type { PlayerStatDraft } from './player-stat-draft'
import { RsvpButtons } from './rsvp-buttons'

interface SummaryTabProps {
  match: Match
  showMatchResult: boolean
  canEnterScore: boolean
  onEnterScore: () => void
  myAttendance?: Attendance
  isRsvpPending: boolean
  onPresent: () => void
  onAbsent: () => void
  attendanceGroups: {
    present: Attendance[]
    pending: Attendance[]
    absent: Attendance[]
  }
  sortedAttendances: Attendance[]
  busyUserId: string | null
  onSetStatus: (userId: string, status: 'present' | 'absent' | 'pending') => void
  statDrafts: Record<string, PlayerStatDraft>
  lineups: Lineup[]
  canManageComposition: boolean
  onEditLineup: () => void
}

export function SummaryTab({
  match,
  showMatchResult,
  canEnterScore,
  onEnterScore,
  myAttendance,
  isRsvpPending,
  onPresent,
  onAbsent,
  attendanceGroups,
  sortedAttendances,
  busyUserId,
  onSetStatus,
  statDrafts,
  lineups,
  canManageComposition,
  onEditLineup,
}: SummaryTabProps) {
  const { t } = useTranslation()
  const presentPlayers = attendanceGroups.present
  const showAttendance = match.status === 'scheduled'
  const lineupButton = canManageComposition ? (
    <Button size="sm" variant="outline" onClick={onEditLineup}>
      {t(
        lineups.length === 0
          ? 'matches.detail.lineupEditor.create'
          : 'matches.detail.lineupEditor.edit',
      )}
    </Button>
  ) : null

  return (
    <>
      {showMatchResult ? (
        <MatchResultScore match={match} canEnterScore={canEnterScore} onEnterScore={onEnterScore} />
      ) : null}

      {match.status === 'played' && match.blueScore != null && match.redScore != null ? (
        <PlayerVotePanel />
      ) : null}

      {showAttendance ? (
        <div className="flex flex-col items-stretch gap-4">
          <section className="flex flex-col lg:flex-row justify-between gap-2 lg:gap-6 items-center rounded-xl border bg-card p-4">
            <p className="text-lg font-medium">{t('matches.detail.rsvp.question')}</p>
            <RsvpButtons
              status={myAttendance?.status}
              disabled={isRsvpPending}
              onPresent={onPresent}
              onAbsent={onAbsent}
            />
          </section>

          <section className="flex flex-col rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-medium">
                <span className="text-primary text-2xl">{presentPlayers.length}</span>{' '}
                {t('matches.detail.attendance.present')}
              </h2>
              {lineupButton}
            </div>
            {presentPlayers.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t('matches.detail.attendance.empty')}
              </p>
            ) : (
              <div className="mt-3 flex gap-4 flex-wrap">
                {presentPlayers.map((player) => {
                  const playerStats = showMatchResult ? statDrafts[player.userId] : undefined
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <PlayerAvatar name={player.userName} imageUrl={player.image} size="lg" />
                        <span className="truncate">{player.userName}</span>
                      </span>
                      {playerStats ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {t('matches.detail.summary.goals')} {playerStats.goals}
                          {' · '}
                          {t('matches.detail.summary.assists')} {playerStats.assists}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-medium">{t('matches.detail.summary.lineup')}</h2>
          {showAttendance ? null : lineupButton}
        </div>
        <LineupSection lineups={lineups} />
      </section>

      {showAttendance ? (
        canManageComposition ? (
          <AttendanceManager
            players={sortedAttendances}
            busyUserId={busyUserId}
            onSetStatus={onSetStatus}
            statsByUserId={showMatchResult ? statDrafts : undefined}
            goalsLabel={t('matches.detail.summary.goals')}
            assistsLabel={t('matches.detail.summary.assists')}
          />
        ) : (
          <>
            <AttendanceGroup
              title={t('matches.detail.attendance.pending')}
              players={attendanceGroups.pending}
              emptyLabel={t('matches.detail.attendance.empty')}
            />
            <AttendanceGroup
              title={t('matches.detail.attendance.absent')}
              players={attendanceGroups.absent}
              emptyLabel={t('matches.detail.attendance.empty')}
            />
          </>
        )
      ) : null}
    </>
  )
}
