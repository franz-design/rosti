import { EntityManager } from '@mikro-orm/core'
import { CreateRequestContext } from '@mikro-orm/decorators/legacy'
import { Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common'
import { config } from '../../config/env.config'
import { Member, Organization, User } from '../auth/auth.entity'
import { EmailService } from '../email/email.service'
import { renderUnsubscribePage } from '../email/unsubscribe-page'
import { buildUnsubscribeUrl, readUnsubscribeToken } from '../email/unsubscribe-token'
import { AttendanceStatus, MatchStatus } from '../matches/contracts/match.contract'
import { MatchAttendance } from '../matches/match-attendance.entity'
import { Match } from '../matches/match.entity'
import { FeeStatus } from '../payments/contracts/payment.contract'
import { MatchCost } from '../payments/match-cost.entity'
import { buildPaymentUrl } from '../payments/payment-link'
import { PaymentService } from '../payments/payment.service'
import { SessionFee } from '../payments/session-fee.entity'
import { type AppPushPayload } from './app-push'
import { chatPush } from './chat-push'
import {
  DevicePlatform,
  RegisterWebPushInput,
  ScheduledJobStatus,
  ScheduledJobType,
} from './contracts/notification.contract'
import { deliverWebPush } from './web-push-sender'
import { DeviceToken } from './device-token.entity'
import { NotificationPreference } from './notification-preference.entity'
import { ScheduledJob } from './scheduled-job.entity'
import {
  canRemindFee,
  planFeeReminderRunAts,
  shouldScheduleFeeRequest,
  shouldSendFeeRequest,
} from './fee-request'
import {
  computeMatchEndNotificationRunAt,
  earliestMatchEndKickoff,
  readMatchDurationMinutes,
} from './match-end'
import {
  matchInvitePush,
  playerVoteOpenedPush,
  playerVoteResultPush,
  rsvpReminderPush,
  scoreReminderPush,
} from './match-push'
import { canRemindScore, CLUB_ADMIN_ROLES } from './score-reminder'
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
  feeRequestEmail,
  newMatchEmail,
  type NotificationEmailCopy,
  rsvpReminderEmail,
  playerVoteOpenedEmail,
  playerVoteResultEmail,
  scoreReminderEmail,
} from './notification-email'

interface StoredWebPush {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
  private warnedMissingVapid = false

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
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
      notifyPlayerVote: data.notifyPlayerVote ?? prefs.notifyPlayerVote,
      notifyFeeRequest: data.notifyFeeRequest ?? prefs.notifyFeeRequest,
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

  getWebPushPublicKey(): string | null {
    return config.vapid?.publicKey ?? null
  }

  async registerWebPush(userId: string, input: RegisterWebPushInput): Promise<DeviceToken> {
    const user = await this.em.findOne(User, { id: userId })
    if (!user) throw new NotFoundException('User not found')

    const byInstallation = await this.em.findOne(DeviceToken, {
      installationId: input.installationId,
    })
    const byEndpoint = await this.em.findOne(DeviceToken, { token: input.endpoint })
    const device = byInstallation ?? byEndpoint ?? new DeviceToken()
    if (!byInstallation && !byEndpoint) this.em.persist(device)
    if (byInstallation && byEndpoint && byInstallation.id !== byEndpoint.id) {
      this.em.remove(byEndpoint)
    }

    device.user = user
    device.platform = DevicePlatform.Web
    device.token = input.endpoint
    device.p256dh = input.p256dh
    device.authSecret = input.auth
    device.installationId = input.installationId
    await this.em.flush()
    return device
  }

  async removeWebPush(userId: string, installationId: string): Promise<boolean> {
    const device = await this.em.findOne(DeviceToken, {
      installationId,
      user: { id: userId },
    })
    if (!device) return false
    this.em.remove(device)
    await this.em.flush()
    return true
  }

  async scheduleMatchReminders(match: Match, options?: { resetInvite?: boolean }): Promise<void> {
    await this.scheduleScoreReminder(match)
    await this.scheduleFeeRequest(match)
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

  /**
   * Plans the payment request for 90 minutes after kickoff, when the match has a cost
   * and the request has not been sent yet.
   */
  async scheduleFeeRequest(match: Match): Promise<void> {
    const cost = await this.em.findOne(MatchCost, { match: { id: match.id } })
    const existingJobCount = await this.em.count(ScheduledJob, {
      match: { id: match.id },
      type: ScheduledJobType.FeeRequest,
      status: ScheduledJobStatus.Pending,
    })
    if (
      !shouldScheduleFeeRequest({
        status: match.status,
        feesNotifiedAt: cost?.feesNotifiedAt,
        hasCost: cost != null,
        existingJobCount,
      })
    ) {
      return
    }
    await this.enqueue(match, ScheduledJobType.FeeRequest, await this.matchEndRunAt(match))
  }

  async scheduleScoreReminder(match: Match): Promise<void> {
    if (!canRemindScore(match)) return
    await this.enqueue(match, ScheduledJobType.ScoreReminder, await this.matchEndRunAt(match))
  }

  /**
   * Moves pending score and payment jobs to the club's new match length.
   * A notification that already went out stays sent.
   */
  async rescheduleMatchEndNotifications(organizationId: string): Promise<void> {
    const organization = await this.em.findOne(Organization, { id: organizationId })
    if (!organization) return
    const durationMinutes = readMatchDurationMinutes(organization.matchDurationMinutes)
    const now = new Date()
    const jobs = await this.em.find(
      ScheduledJob,
      {
        status: ScheduledJobStatus.Pending,
        type: { $in: [ScheduledJobType.ScoreReminder, ScheduledJobType.FeeRequest] },
        match: { organization: { id: organizationId } },
      },
      { populate: ['match'] },
    )
    for (const job of jobs) {
      job.runAt = computeMatchEndNotificationRunAt(job.match.startsAt, durationMinutes, now)
    }
    if (jobs.length > 0) await this.em.flush()
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
      await this.deliver(
        member.user,
        prefs,
        newMatchEmail(match, config.clients.webApp.url),
        matchInvitePush(matchPushSource(match)),
      )
    }
  }

  async notifyPlayerVoteOpened(match: Match, users: User[]): Promise<void> {
    const email = playerVoteOpenedEmail(match, config.clients.webApp.url)
    const push = playerVoteOpenedPush(matchPushSource(match))
    for (const user of users) {
      const prefs = await this.getOrCreatePreferences(user.id)
      if (!prefs.notifyPlayerVote) continue
      await this.deliver(user, prefs, email, push)
    }
  }

  async notifyPlayerVoteResult(input: {
    match: Match
    users: User[]
    winnerName: string | null
    isTie: boolean
  }): Promise<void> {
    const email = playerVoteResultEmail(
      input.match,
      config.clients.webApp.url,
      input.winnerName,
      input.isTie,
    )
    const push = playerVoteResultPush({
      ...matchPushSource(input.match),
      winnerName: input.winnerName,
      isTie: input.isTie,
    })
    for (const user of input.users) {
      const prefs = await this.getOrCreatePreferences(user.id)
      if (!prefs.notifyPlayerVote) continue
      await this.deliver(user, prefs, email, push)
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
      const isMention = isMentioned && prefs.notifyChatMention
      const isChatMessage = !isMention && prefs.notifyAllChatMessages
      if (!isMention && !isChatMessage) continue

      const emailInput = {
        appUrl: config.clients.webApp.url,
        matchId: match.id,
        matchTitle: match.title,
        authorName: author.name,
        body,
      }
      await this.deliver(
        member.user,
        prefs,
        isMention ? chatMentionEmail(emailInput) : chatMessageEmail(emailInput),
        chatPush({
          isMention,
          organizationId: match.organization.id,
          matchId: match.id,
          matchTitle: match.title,
          authorName: author.name,
          body,
        }),
      )
    }
  }

  @CreateRequestContext()
  async processDueJobs(): Promise<number> {
    await this.ensureScoreReminders()
    await this.ensureFeeRequests()
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
        } else if (job.type === ScheduledJobType.FeeRequest) {
          await this.sendFeeRequests(job.match)
        } else if (job.type === ScheduledJobType.FeeReminder) {
          await this.remindUnpaidFees(job.match)
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

  private async ensureFeeRequests(): Promise<void> {
    const now = new Date()
    const matches = await this.em.find(
      Match,
      {
        status: { $ne: MatchStatus.Cancelled },
        startsAt: { $gt: earliestMatchEndKickoff(now), $lte: now },
      },
      { populate: ['organization'], limit: 50 },
    )

    for (const match of matches) {
      const cost = await this.em.findOne(MatchCost, { match: { id: match.id } })
      if (
        !shouldSendFeeRequest({
          status: match.status,
          feesNotifiedAt: cost?.feesNotifiedAt,
          hasCost: cost != null,
        })
      ) {
        continue
      }
      if (!this.hasMatchEnded(match, now)) continue
      const existing = await this.em.count(ScheduledJob, {
        match: { id: match.id },
        type: ScheduledJobType.FeeRequest,
        status: ScheduledJobStatus.Pending,
      })
      if (existing > 0) continue
      await this.enqueue(match, ScheduledJobType.FeeRequest, now)
    }
  }

  private async sendFeeRequests(match: Match): Promise<void> {
    await this.em.populate(match, ['organization'])
    if (match.status === MatchStatus.Cancelled) return

    const cost = await this.em.findOne(MatchCost, { match: { id: match.id } })
    if (!cost || cost.feesNotifiedAt) return

    await this.paymentService.recomputeFees(match.id)
    const fees = await this.em.find(SessionFee, { match: { id: match.id } }, { populate: ['user'] })
    for (const fee of fees) {
      if (fee.status !== FeeStatus.Owed || fee.amountCents <= 0) continue
      await this.deliverFeeEmail(fee, match, false)
    }

    const notifiedAt = new Date()
    cost.feesNotifiedAt = notifiedAt
    const delays = match.organization.feeReminderDelaysDays ?? []
    for (const runAt of planFeeReminderRunAts(notifiedAt, delays)) {
      this.persistJob(match, ScheduledJobType.FeeReminder, runAt)
    }
    await this.em.flush()
  }

  /**
   * Emails every player who still owes money and was not reminded in the last 20 hours.
   * Returns how many emails were sent.
   */
  async remindUnpaidFees(match: Match): Promise<number> {
    await this.em.populate(match, ['organization'])
    if (match.status === MatchStatus.Cancelled) return 0

    const fees = await this.em.find(
      SessionFee,
      { match: { id: match.id }, status: FeeStatus.Owed },
      { populate: ['user'] },
    )
    const now = new Date()
    let remindedCount = 0
    for (const fee of fees) {
      if (fee.amountCents <= 0) continue
      if (!canRemindFee({ status: fee.status, lastRemindedAt: fee.lastRemindedAt, now })) continue
      const sent = await this.deliverFeeEmail(fee, match, true)
      if (!sent) continue
      fee.reminderCount += 1
      fee.lastRemindedAt = now
      remindedCount += 1
    }
    await this.em.flush()
    return remindedCount
  }

  private async deliverFeeEmail(
    fee: SessionFee,
    match: Match,
    isReminder: boolean,
  ): Promise<boolean> {
    const prefs = await this.getOrCreatePreferences(fee.user.id)
    if (!prefs.notifyFeeRequest) return false
    await this.deliver(
      fee.user,
      prefs,
      feeRequestEmail({
        match,
        appUrl: config.clients.webApp.url,
        amountCents: fee.amountCents,
        paymentUrl: buildPaymentUrl(match.organization.paymentLink, fee.amountCents),
        isReminder,
        shares: fee.shares,
      }),
    )
    return true
  }

  private async ensureScoreReminders(): Promise<void> {
    const now = new Date()
    const matches = await this.em.find(
      Match,
      {
        status: { $ne: MatchStatus.Cancelled },
        startsAt: { $gt: earliestMatchEndKickoff(now), $lte: now },
      },
      { populate: ['organization'], limit: 50 },
    )

    for (const match of matches) {
      if (!canRemindScore(match)) continue
      if (!this.hasMatchEnded(match, now)) continue
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
      await this.deliver(
        member.user,
        prefs,
        scoreReminderEmail(match, config.clients.webApp.url),
        scoreReminderPush(matchPushSource(match)),
      )
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
      await this.deliver(
        member.user,
        prefs,
        rsvpReminderEmail(match, config.clients.webApp.url),
        rsvpReminderPush(matchPushSource(match)),
      )
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

  private async matchEndRunAt(match: Match, now: Date = new Date()): Promise<Date> {
    await this.em.populate(match, ['organization'])
    return computeMatchEndNotificationRunAt(
      match.startsAt,
      readMatchDurationMinutes(match.organization.matchDurationMinutes),
      now,
    )
  }

  private hasMatchEnded(match: Match, now: Date): boolean {
    const dueAt = computeMatchEndNotificationRunAt(
      match.startsAt,
      readMatchDurationMinutes(match.organization.matchDurationMinutes),
      now,
    )
    return dueAt.getTime() <= now.getTime()
  }

  private async deliver(
    user: User,
    prefs: NotificationPreference,
    email: NotificationEmailCopy,
    push?: AppPushPayload,
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
    if (!prefs.pushEnabled) return

    if (!push) {
      const devices = await this.em.find(DeviceToken, {
        user: { id: user.id },
      })
      for (const device of devices) {
        this.logger.log(
          `Push to ${device.platform} token ${device.token.slice(0, 8)}…: ${email.subject}`,
        )
      }
      return
    }

    const devices = await this.em.find(DeviceToken, {
      user: { id: user.id },
      platform: DevicePlatform.Web,
    })
    const subscriptions = devices.flatMap((device): StoredWebPush[] => {
      if (!device.p256dh || !device.authSecret) return []
      return [
        {
          id: device.id,
          endpoint: device.token,
          p256dh: device.p256dh,
          auth: device.authSecret,
        },
      ]
    })
    this.dispatchWebPush(subscriptions, push)
  }

  /**
   * The message is already saved. A slow push service must not hold the chat request.
   */
  private dispatchWebPush(subscriptions: StoredWebPush[], push: AppPushPayload): void {
    if (subscriptions.length === 0) return
    const vapid = config.vapid
    if (!vapid) {
      if (!this.warnedMissingVapid) {
        this.warnedMissingVapid = true
        this.logger.warn('Web Push is not configured. Pushes are skipped.')
      }
      return
    }

    const em = this.em.fork()
    void this.sendWebPushes(em, subscriptions, push, vapid).catch((err: unknown) => {
      this.logger.error('Web push failed', err)
    })
  }

  private async sendWebPushes(
    em: EntityManager,
    subscriptions: StoredWebPush[],
    push: AppPushPayload,
    vapid: NonNullable<typeof config.vapid>,
  ): Promise<void> {
    const goneIds: string[] = []
    await Promise.all(
      subscriptions.map(async (subscription) => {
        const result = await deliverWebPush({
          vapid,
          subscription,
          payload: JSON.stringify(push),
        })
        if (result === 'gone') goneIds.push(subscription.id)
        if (result === 'failed') {
          this.logger.warn(`Web push failed for device ${subscription.id}`)
        }
      }),
    )
    if (goneIds.length === 0) return

    const devices = await em.find(DeviceToken, { id: { $in: goneIds } })
    for (const device of devices) em.remove(device)
    await em.flush()
  }
}

function matchPushSource(match: Match): {
  organizationId: string
  matchId: string
  matchTitle: string
} {
  return {
    organizationId: match.organization.id,
    matchId: match.id,
    matchTitle: match.title,
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
