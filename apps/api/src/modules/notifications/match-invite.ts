import { AttendanceStatus } from '../matches/contracts/match.contract'
import { ScheduledJobType } from './contracts/notification.contract'

export const DEFAULT_MATCH_INVITE_LEAD_DAYS = 5

export const MATCH_INVITE_LEAD_DAY_OPTIONS = [1, 2, 3, 5, 7, 14] as const

export const DAY_IN_MS = 24 * 60 * 60 * 1000

export interface MatchInviteScheduleInput {
  startsAt: Date
  now: Date
  leadDays: number
  reminderLeadDays?: number | null
  isNextMatch: boolean
  inviteAlreadySent: boolean
  reminderAlreadySent: boolean
}

export interface PlannedMatchNotification {
  type: ScheduledJobType.MatchInvite | ScheduledJobType.RsvpReminder
  runAt: Date
  leadDays: number
}

export function planMatchInviteJobs(input: MatchInviteScheduleInput): PlannedMatchNotification[] {
  if (input.startsAt <= input.now) return []
  if (!input.isNextMatch) return []

  const leadDays = normalizeLeadDays(input.leadDays)
  const jobs: PlannedMatchNotification[] = []

  if (!input.inviteAlreadySent) {
    const inviteAt = new Date(input.startsAt.getTime() - leadDays * DAY_IN_MS)
    if (inviteAt > input.now) {
      jobs.push({
        type: ScheduledJobType.MatchInvite,
        runAt: inviteAt,
        leadDays,
      })
    } else if (input.isNextMatch) {
      jobs.push({
        type: ScheduledJobType.MatchInvite,
        runAt: input.now,
        leadDays,
      })
    }
  }

  const reminderLeadDays = input.reminderLeadDays
  if (
    reminderLeadDays != null &&
    reminderLeadDays > 0 &&
    reminderLeadDays < leadDays &&
    !input.reminderAlreadySent
  ) {
    const reminderAt = new Date(input.startsAt.getTime() - reminderLeadDays * DAY_IN_MS)
    if (reminderAt > input.now) {
      jobs.push({
        type: ScheduledJobType.RsvpReminder,
        runAt: reminderAt,
        leadDays: reminderLeadDays,
      })
    }
  }

  return jobs
}

export function shouldSendRsvpReminder(status: AttendanceStatus | undefined): boolean {
  return status == null || status === AttendanceStatus.Pending
}

function normalizeLeadDays(leadDays: number): number {
  if (!Number.isFinite(leadDays) || leadDays < 1) return DEFAULT_MATCH_INVITE_LEAD_DAYS
  return Math.floor(leadDays)
}
