import { EntityManager } from '@mikro-orm/core'
import { CreateRequestContext } from '@mikro-orm/decorators/legacy'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '../../config/env.config'
import { Member, Organization, User } from '../auth/auth.entity'
import { EmailService } from '../email/email.service'
import { renderUnsubscribePage } from '../email/unsubscribe-page'
import { buildUnsubscribeUrl, readUnsubscribeToken } from '../email/unsubscribe-token'
import { AttendanceStatus, MatchStatus } from '../matches/contracts/match.contract'
import { MatchAttendance } from '../matches/match-attendance.entity'
import { Match } from '../matches/match.entity'
import {
  DevicePlatform,
  ScheduledJobStatus,
  ScheduledJobType,
} from './contracts/notification.contract'
import { DeviceToken } from './device-token.entity'
import { NotificationPreference } from './notification-preference.entity'
import { ScheduledJob } from './scheduled-job.entity'
import {
  canRemindScore,
  CLUB_ADMIN_ROLES,
  computeScoreReminderRunAt,
  SCORE_REMINDER_DELAY_MS,
} from './score-reminder'
import {
  DEFAULT_MATCH_INVITE_LEAD_DAYS,
  planMatchInviteJobs,
  type PlannedMatchNotification,
  shouldSendRsvpReminder,
} from './match-invite'
import {
  cancelledMatchEmail,
  chatMentionEmail,
  chatMessageEmail,
  newMatchEmail,
  type NotificationEmailCopy,
  rsvpReminderEmail,
  scoreReminderEmail,
} from './notification-email'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
  ) {}

  async getOrCreatePreferences(userId: string): Promise<NotificationPreference> {
    let prefs = await this.em.findOne(NotificationPreference, { user: { id: userId } })
    if (!prefs) {
      const user = await this.em.findOne(User, { id: userId })
      if (!user) throw new Error('User not found')
      prefs = new NotificationPreference()
      prefs.user = user
      this.em.persist(prefs)
      await this.em.flush()
    }
    return prefs
  }

  async updatePreferences(
    userId: string,
    data: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    const prefs = await this.getOrCreatePreferences(userId)
    Object.assign(prefs, {
      emailEnabled: data.emailEnabled ?? prefs.emailEnabled,
      pushEnabled: data.pushEnabled ?? prefs.pushEnabled,
      notifyNewMatch: data.notifyNewMatch ?? prefs.notifyNewMatch,
      notifyRsvpReminder: data.notifyRsvpReminder ?? prefs.notifyRsvpReminder,
      notifyMatchCancelled: data.notifyMatchCancelled ?? prefs.notifyMatchCancelled,
      notifyChatMention: data.notifyChatMention ?? prefs.notifyChatMention,
      notifyAllChatMessages: data.notifyAllChatMessages ?? prefs.notifyAllChatMessages,
    })
    await this.em.flush()
    return prefs
  }

  async registerDevice(
    userId: string,
    token: string,
    platform: DevicePlatform,
  ): Promise<DeviceToken> {
    const user = await this.em.findOne(User, { id: userId })
    if (!user) throw new Error('User not found')
    let device = await this.em.findOne(DeviceToken, { token })
    if (!device) {
      device = new DeviceToken()
      device.token = token
      this.em.persist(device)
    }
    device.user = user
    device.platform = platform
    await this.em.flush()
    return device
  }

  async scheduleMatchReminders(match: Match, options?: { resetInvite?: boolean }): Promise<void> {
    await this.scheduleScoreReminder(match)
    await this.syncUpcomingMatchInvites(match.organization.id, {
      resetMatchIds: options?.resetInvite ? [match.id] : [],
    })
  }

  /**
   * Plans the registration email for the next match only, using the club delay.
   * Later matches wait until they become the next one.
   * If the delay has already passed, that next match is sent now.
   */
  async syncUpcomingMatchInvites(
    organizationId: string,
    options?: { resetMatchIds?: string[] },
  ): Promise<void> {
    const organization = await this.em.findOne(Organization, {
      id: organizationId,
    })
    if (!organization) return

    const now = new Date()
    const matches = await this.em.find(
      Match,
      {
        organization: { id: organizationId },
        status: MatchStatus.Scheduled,
        startsAt: { $gt: now },
      },
      { orderBy: { startsAt: 'ASC' } },
    )
    const resetMatchIds = new Set(options?.resetMatchIds ?? [])
    const nextMatchId = matches[0]?.id

    for (const match of matches) {
      await this.rescheduleMatchInviteJobs({
        match,
        organization,
        now,
        isNextMatch: match.id === nextMatchId,
        resetSent: resetMatchIds.has(match.id),
      })
    }
  }

  async scheduleScoreReminder(match: Match): Promise<void> {
    if (!canRemindScore(match)) return
    await this.enqueue(
      match,
      ScheduledJobType.ScoreReminder,
      computeScoreReminderRunAt(match.startsAt),
    )
  }

  private async enqueue(
    match: Match,
    type: ScheduledJobType,
    runAt: Date,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    this.persistJob(match, type, runAt, payload)
    await this.em.flush()
  }

  async cancelMatchJobs(matchId: string, type?: ScheduledJobType): Promise<void> {
    const jobs = await this.em.find(ScheduledJob, {
      match: { id: matchId },
      status: ScheduledJobStatus.Pending,
      ...(type ? { type } : {}),
    })
    for (const job of jobs) job.status = ScheduledJobStatus.Cancelled
    await this.em.flush()
  }

  async notifyNewMatch(match: Match): Promise<void> {
    const members = await this.em.find(
      Member,
      { organization: { id: match.organization.id } },
      { populate: ['user'] },
    )
    for (const member of members) {
      const prefs = await this.getOrCreatePreferences(member.user.id)
      if (!prefs.notifyNewMatch) continue
      await this.deliver(member.user, prefs, newMatchEmail(match, config.clients.webApp.url))
    }
  }

  async notifyMatchCancelled(match: Match): Promise<void> {
    const present = await this.em.find(
      MatchAttendance,
      { match: { id: match.id }, status: AttendanceStatus.Present },
      { populate: ['user'] },
    )
    for (const row of present) {
      const prefs = await this.getOrCreatePreferences(row.user.id)
      if (!prefs.notifyMatchCancelled) continue
      await this.deliver(
        row.user,
        prefs,
        cancelledMatchEmail(match, config.clients.webApp.url, match.cancellationReason),
      )
    }
  }

  async notifyChatMessage(
    match: Match,
    author: User,
    body: string,
    mentionedUserIds: string[],
  ): Promise<void> {
    const members = await this.em.find(
      Member,
      { organization: { id: match.organization.id } },
      { populate: ['user'] },
    )
    for (const member of members) {
      if (member.user.id === author.id) continue
      const prefs = await this.getOrCreatePreferences(member.user.id)
      const isMentioned = mentionedUserIds.includes(member.user.id)
      if (isMentioned && prefs.notifyChatMention) {
        await this.deliver(
          member.user,
          prefs,
          chatMentionEmail({
            appUrl: config.clients.webApp.url,
            matchId: match.id,
            matchTitle: match.title,
            authorName: author.name,
            body,
          }),
        )
        continue
      }
      if (prefs.notifyAllChatMessages) {
        await this.deliver(
          member.user,
          prefs,
          chatMessageEmail({
            appUrl: config.clients.webApp.url,
            matchId: match.id,
            matchTitle: match.title,
            authorName: author.name,
            body,
          }),
        )
      }
    }
  }

  @CreateRequestContext()
  async processDueJobs(): Promise<number> {
    await this.ensureScoreReminders()
    await this.syncAllUpcomingMatchInvites()
    const now = new Date()
    const jobs = await this.em.find(
      ScheduledJob,
      { status: ScheduledJobStatus.Pending, runAt: { $lte: now } },
      { populate: ['match', 'match.organization'], limit: 50 },
    )
    for (const job of jobs) {
      try {
        if (job.type === ScheduledJobType.MatchInvite) {
          await this.notifyNewMatch(job.match)
        } else if (job.type === ScheduledJobType.RsvpReminder) {
          await this.sendRsvpReminders(job.match)
        } else if (job.type === ScheduledJobType.ScoreReminder) {
          await this.sendScoreReminders(job.match)
        }
        job.status = ScheduledJobStatus.Done
      } catch (err) {
        this.logger.error(`Job ${job.id} failed`, err)
        job.status = ScheduledJobStatus.Failed
      }
    }
    await this.em.flush()
    return jobs.length
  }

  private async ensureScoreReminders(): Promise<void> {
    const now = new Date()
    const latestKickoff = new Date(now.getTime() - SCORE_REMINDER_DELAY_MS)
    const earliestKickoff = new Date(latestKickoff.getTime() - 6 * 60 * 60 * 1000)

    const matches = await this.em.find(
      Match,
      {
        status: { $ne: MatchStatus.Cancelled },
        startsAt: { $gt: earliestKickoff, $lte: latestKickoff },
      },
      { populate: ['organization'], limit: 50 },
    )

    for (const match of matches) {
      if (!canRemindScore(match)) continue
      const existing = await this.em.count(ScheduledJob, {
        match: { id: match.id },
        type: ScheduledJobType.ScoreReminder,
      })
      if (existing > 0) continue
      await this.enqueue(match, ScheduledJobType.ScoreReminder, now)
    }
  }

  private async sendScoreReminders(match: Match): Promise<void> {
    if (!canRemindScore(match)) return

    const admins = await this.em.find(
      Member,
      {
        organization: { id: match.organization.id },
        role: { $in: [...CLUB_ADMIN_ROLES] },
      },
      { populate: ['user'] },
    )
    for (const member of admins) {
      const prefs = await this.getOrCreatePreferences(member.user.id)
      await this.deliver(member.user, prefs, scoreReminderEmail(match, config.clients.webApp.url))
    }
  }

  private async sendRsvpReminders(match: Match): Promise<void> {
    const members = await this.em.find(
      Member,
      { organization: { id: match.organization.id } },
      { populate: ['user'] },
    )
    const attendances = await this.em.find(
      MatchAttendance,
      { match: { id: match.id } },
      { populate: ['user'] },
    )
    const statusByUserId = new Map(attendances.map((row) => [row.user.id, row.status]))

    for (const member of members) {
      if (!shouldSendRsvpReminder(statusByUserId.get(member.user.id))) continue
      const prefs = await this.getOrCreatePreferences(member.user.id)
      if (!prefs.notifyRsvpReminder) continue
      await this.deliver(member.user, prefs, rsvpReminderEmail(match, config.clients.webApp.url))
    }
  }

  private async rescheduleMatchInviteJobs(input: {
    match: Match
    organization: Organization
    now: Date
    isNextMatch: boolean
    resetSent: boolean
  }): Promise<void> {
    const jobs = await this.em.find(ScheduledJob, {
      match: { id: input.match.id },
      type: {
        $in: [ScheduledJobType.MatchInvite, ScheduledJobType.RsvpReminder],
      },
    })
    const inviteAlreadySent =
      !input.resetSent &&
      jobs.some(
        (job) =>
          job.type === ScheduledJobType.MatchInvite && job.status === ScheduledJobStatus.Done,
      )
    const reminderAlreadySent =
      !input.resetSent &&
      jobs.some(
        (job) =>
          job.type === ScheduledJobType.RsvpReminder && job.status === ScheduledJobStatus.Done,
      )

    const planned = planMatchInviteJobs({
      startsAt: input.match.startsAt,
      now: input.now,
      leadDays: input.organization.matchInviteLeadDays || DEFAULT_MATCH_INVITE_LEAD_DAYS,
      reminderLeadDays: input.organization.matchInviteReminderLeadDays,
      isNextMatch: input.isNextMatch,
      inviteAlreadySent,
      reminderAlreadySent,
    })

    let changed = false
    for (const job of jobs) {
      if (job.status !== ScheduledJobStatus.Pending) continue
      const stillPlanned = planned.some((item) => isSamePlannedJob(job, item, input.now))
      if (!stillPlanned) {
        job.status = ScheduledJobStatus.Cancelled
        changed = true
      }
    }

    for (const item of planned) {
      const alreadyPending = jobs.some(
        (job) =>
          job.status === ScheduledJobStatus.Pending && isSamePlannedJob(job, item, input.now),
      )
      if (alreadyPending) continue
      this.persistJob(input.match, item.type, item.runAt, {
        leadDays: item.leadDays,
      })
      changed = true
    }

    if (changed) await this.em.flush()
  }

  private async syncAllUpcomingMatchInvites(): Promise<void> {
    const now = new Date()
    const matches = await this.em.find(
      Match,
      {
        status: MatchStatus.Scheduled,
        startsAt: { $gt: now },
      },
      { populate: ['organization'] },
    )
    const organizationIds = [...new Set(matches.map((match) => match.organization.id))]
    for (const organizationId of organizationIds) {
      await this.syncUpcomingMatchInvites(organizationId)
    }
  }

  private persistJob(
    match: Match,
    type: ScheduledJobType,
    runAt: Date,
    payload?: Record<string, unknown>,
  ): ScheduledJob {
    const job = new ScheduledJob()
    job.match = match
    job.type = type
    job.runAt = runAt
    job.payload = payload
    job.status = ScheduledJobStatus.Pending
    this.em.persist(job)
    return job
  }

  /**
   * Turns notification emails off. Account emails (password, address check) still send.
   */
  async unsubscribeByToken(token: string): Promise<string> {
    const userId = readUnsubscribeToken(token, config.betterAuth.secret)
    if (!userId) return renderUnsubscribePage({ kind: 'invalid' })

    const user = await this.em.findOne(User, { id: userId })
    if (!user) return renderUnsubscribePage({ kind: 'invalid' })

    const prefs = await this.getOrCreatePreferences(userId)
    prefs.emailEnabled = false
    await this.em.flush()
    return renderUnsubscribePage({
      kind: 'done',
      appUrl: config.clients.webApp.url,
    })
  }

  private async deliver(
    user: User,
    prefs: NotificationPreference,
    email: NotificationEmailCopy,
  ): Promise<void> {
    if (prefs.emailEnabled) {
      await this.emailService.sendEmail({
        to: user.email,
        subject: email.subject,
        paragraphs: email.paragraphs,
        action: email.action,
        unsubscribeUrl: buildUnsubscribeUrl(user.id),
      })
    }
    if (prefs.pushEnabled) {
      const devices = await this.em.find(DeviceToken, {
        user: { id: user.id },
      })
      for (const device of devices) {
        this.logger.log(
          `Push to ${device.platform} token ${device.token.slice(0, 8)}…: ${email.subject}`,
        )
      }
    }
  }
}

function isSamePlannedJob(
  job: ScheduledJob,
  planned: PlannedMatchNotification,
  now: Date,
): boolean {
  if (job.type !== planned.type) return false
  const delta = Math.abs(job.runAt.getTime() - planned.runAt.getTime())
  if (delta < 60_000) return true
  return planned.runAt.getTime() <= now.getTime() && job.runAt.getTime() <= now.getTime()
}
