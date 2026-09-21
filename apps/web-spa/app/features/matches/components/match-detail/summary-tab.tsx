import { Button } from '@rosti/ui/components/primitives/button'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Attendance, Lineup, Match } from '@/lib/rosti-api'
import { AttendanceGroup } from './attendance/attendance-group'
import { LineupSection } from './lineup/lineup-section'
import { MatchInfoItem } from './match-info-item'
import { MatchResultScore } from './match-result-score'
import type { PlayerStatDraft } from './player-stat-draft'
import { RsvpButtons } from './rsvp-buttons'

interface SummaryTabProps {
  match: Match
  dateLabel: string
  timeLabel: string
  showMatchResult: boolean
  canEnterScore: boolean
  onEnterScore: () => void
  canRsvp: boolean
  myAttendance?: Attendance
  isRsvpPending: boolean
  onPresent: () => void
  onAbsent: () => void
  presentPlayers: Attendance[]
  statDrafts: Record<string, PlayerStatDraft>
  lineups: Lineup[]
  canManageComposition: boolean
  onEditLineup: () => void
}

export function SummaryTab({
  match,
  dateLabel,
  timeLabel,
  showMatchResult,
  canEnterScore,
  onEnterScore,
  canRsvp,
  myAttendance,
  isRsvpPending,
  onPresent,
  onAbsent,
  presentPlayers,
  statDrafts,
  lineups,
  canManageComposition,
  onEditLineup,
}: SummaryTabProps) {
  const { t } = useTranslation()

  return (
    <>
      {showMatchResult ? (
        <MatchResultScore
          match={match}
          canEnterScore={canEnterScore}
          onEnterScore={onEnterScore}
        />
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-3">
        <MatchInfoItem
          icon={<CalendarDays className="size-4" />}
          label={t('matches.detail.summary.date')}
          value={dateLabel}
        />
        <MatchInfoItem
          icon={<Clock className="size-4" />}
          label={t('matches.detail.summary.time')}
          value={timeLabel}
        />
        <MatchInfoItem
          icon={<MapPin className="size-4" />}
          label={t('matches.detail.summary.location')}
          value={match.location ?? t('matches.detail.noLocation')}
        />
      </dl>

      {canRsvp ? (
        <section className="space-y-3">
          <p className="text-sm font-medium">{t('matches.detail.rsvp.question')}</p>
          <RsvpButtons
            status={myAttendance?.status}
            disabled={isRsvpPending}
            onPresent={onPresent}
            onAbsent={onAbsent}
          />
        </section>
      ) : null}

      <AttendanceGroup
        title={t('matches.detail.summary.presentPlayers')}
        players={presentPlayers}
        emptyLabel={t('matches.detail.summary.noPresent')}
        statsByUserId={showMatchResult ? statDrafts : undefined}
        goalsLabel={t('matches.detail.summary.goals')}
        assistsLabel={t('matches.detail.summary.assists')}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-medium">{t('matches.detail.summary.lineup')}</h2>
          {canManageComposition ? (
            <Button size="sm" variant="outline" onClick={onEditLineup}>
              {t(
                lineups.length === 0
                  ? 'matches.detail.lineupEditor.create'
                  : 'matches.detail.lineupEditor.edit',
              )}
            </Button>
          ) : null}
        </div>
        <LineupSection lineups={lineups} />
      </section>
    </>
  )
}
