import { EntityManager } from '@mikro-orm/core'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Organization, User } from '../auth/auth.entity'
import { OrganizationService } from '../auth/organization.service'
import { ScheduledJobType } from '../notifications/contracts/notification.contract'
import { NotificationService } from '../notifications/notification.service'
import { Season } from '../seasons/season.entity'
import {
  CancelMatchInput,
  CreateMatchInput,
  RespondAttendanceInput,
  SetAttendanceInput,
  SetLineupInput,
  UpdateMatchInput,
} from './contracts/match.contract'
import {
  AttendanceStatus,
  MatchStatus,
  TeamSide,
} from './contracts/match.contract'
import { MatchAttendance } from './match-attendance.entity'
import { MatchLineup } from './match-lineup.entity'
import { buildOccurrenceDates } from './match-occurrences'
import { MatchSeries } from './match-series.entity'
import { Match } from './match.entity'

@Injectable()
export class MatchService {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(organizationId: string, userId: string, data: CreateMatchInput): Promise<Match[]> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const organization = await this.em.findOne(Organization, { id: organizationId })
    if (!organization) throw new NotFoundException('Club not found')
    const season = await this.em.findOne(Season, {
      id: data.seasonId,
      organization: { id: organizationId },
    })
    if (!season) throw new NotFoundException('Season not found')
    const createdBy = await this.em.findOne(User, { id: userId })
    if (!createdBy) throw new NotFoundException('User not found')

    const starts: Date[] = data.recurrence
      ? buildOccurrenceDates(data.startsAt, data.recurrence)
      : [data.startsAt]

    let series: MatchSeries | undefined
    if (data.recurrence) {
      series = new MatchSeries()
      series.organization = organization
      series.season = season
      series.title = data.title
      series.location = data.location
      series.maxCapacity = data.maxCapacity
      series.frequency = data.recurrence.frequency
      series.rrule = data.recurrence.rrule
      series.startsAt = data.startsAt
      series.endsAt = data.recurrence.endsAt
      series.reminderOffsetsHours = data.reminderOffsetsHours
      series.createdBy = createdBy
      this.em.persist(series)
    }

    const matches: Match[] = []
    for (const startsAt of starts) {
      const match = new Match()
      match.organization = organization
      match.season = season
      match.series = series
      match.title = data.title
      match.startsAt = startsAt
      match.location = data.location
      match.maxCapacity = data.maxCapacity
      match.reminderOffsetsHours = data.reminderOffsetsHours
      match.createdBy = createdBy
      match.status = MatchStatus.Scheduled
      this.em.persist(match)
      matches.push(match)
    }

    await this.em.flush()

    for (const match of matches) {
      await this.seedPendingAttendances(match)
      await this.notificationService.scheduleScoreReminder(match)
    }
    await this.notificationService.syncUpcomingMatchInvites(organization.id)

    return matches
  }

  private async seedPendingAttendances(match: Match): Promise<void> {
    const members = await this.organizationService.listMembers(match.organization.id)
    for (const member of members) {
      const attendance = new MatchAttendance()
      attendance.match = match
      attendance.user = member.user
      attendance.status = AttendanceStatus.Pending
      this.em.persist(attendance)
    }
    await this.em.flush()
  }

  async list(organizationId: string, userId: string, seasonId?: string): Promise<Match[]> {
    await this.organizationService.requireMember(organizationId, userId)
    return this.em.find(
      Match,
      {
        organization: { id: organizationId },
        ...(seasonId ? { season: { id: seasonId } } : {}),
      },
      { populate: ['organization', 'season'], orderBy: { startsAt: 'ASC' } },
    )
  }

  async countPresentByMatchIds(matchIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>(matchIds.map((id) => [id, 0]))
    if (matchIds.length === 0) return counts

    const rows = await this.em.find(
      MatchAttendance,
      {
        match: { id: { $in: matchIds } },
        status: AttendanceStatus.Present,
      },
      { fields: ['match'] },
    )

    for (const row of rows) {
      const matchId = row.match.id
      counts.set(matchId, (counts.get(matchId) ?? 0) + 1)
    }

    return counts
  }

  async countPresent(matchId: string): Promise<number> {
    return this.em.count(MatchAttendance, {
      match: { id: matchId },
      status: AttendanceStatus.Present,
    })
  }

  async findViewerTeamsByMatchIds(input: {
    userId: string
    matchIds: string[]
  }): Promise<Map<string, TeamSide>> {
    const teams = new Map<string, TeamSide>()
    if (input.matchIds.length === 0) return teams

    const rows = await this.em.find(
      MatchLineup,
      {
        match: { id: { $in: input.matchIds } },
        user: { id: input.userId },
      },
      { fields: ['match', 'team'] },
    )

    for (const row of rows) {
      teams.set(row.match.id, row.team)
    }

    return teams
  }

  async get(organizationId: string, userId: string, matchId: string): Promise<Match> {
    await this.organizationService.requireMember(organizationId, userId)
    const match = await this.em.findOne(
      Match,
      { id: matchId, organization: { id: organizationId } },
      {
        populate: ['organization', 'season', 'series'],
      },
    )
    if (!match) throw new NotFoundException('Match not found')
    return match
  }

  async update(
    organizationId: string,
    userId: string,
    matchId: string,
    data: UpdateMatchInput,
  ): Promise<Match> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const match = await this.get(organizationId, userId, matchId)
    if (match.status === MatchStatus.Cancelled) {
      throw new BadRequestException('Cannot update a cancelled match')
    }
    const previousStartsAt = match.startsAt
    if (data.title !== undefined) match.title = data.title
    if (data.startsAt !== undefined) match.startsAt = data.startsAt
    if (data.location !== undefined) match.location = data.location ?? undefined
    if (data.maxCapacity !== undefined) match.maxCapacity = data.maxCapacity
    if (data.blueScore !== undefined) match.blueScore = data.blueScore ?? undefined
    if (data.redScore !== undefined) match.redScore = data.redScore ?? undefined
    if (data.reminderOffsetsHours !== undefined) {
      match.reminderOffsetsHours = data.reminderOffsetsHours ?? undefined
    }
    await this.em.flush()

    const startsAtChanged = match.startsAt.getTime() !== previousStartsAt.getTime()
    const hasScore = match.blueScore != null && match.redScore != null
    if (startsAtChanged) {
      await this.notificationService.cancelMatchJobs(match.id)
      await this.notificationService.scheduleMatchReminders(match, {
        resetInvite: true,
      })
    } else if (hasScore && (data.blueScore !== undefined || data.redScore !== undefined)) {
      await this.notificationService.cancelMatchJobs(match.id, ScheduledJobType.ScoreReminder)
    }

    return match
  }

  async cancel(
    organizationId: string,
    userId: string,
    matchId: string,
    data: CancelMatchInput,
  ): Promise<Match> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const match = await this.get(organizationId, userId, matchId)
    match.status = MatchStatus.Cancelled
    match.cancellationReason = data.reason
    await this.em.flush()
    await this.notificationService.cancelMatchJobs(match.id)
    await this.notificationService.notifyMatchCancelled(match)
    await this.notificationService.syncUpcomingMatchInvites(match.organization.id)
    return match
  }

  async respondAttendance(
    organizationId: string,
    userId: string,
    matchId: string,
    data: RespondAttendanceInput,
  ): Promise<MatchAttendance> {
    await this.organizationService.requireMember(organizationId, userId)
    const match = await this.get(organizationId, userId, matchId)
    if (match.status !== MatchStatus.Scheduled) {
      throw new BadRequestException('Match is not open for RSVP')
    }

    let attendance = await this.em.findOne(
      MatchAttendance,
      { match: { id: matchId }, user: { id: userId } },
      { populate: ['user', 'match'] },
    )
    if (!attendance) {
      const user = await this.em.findOne(User, { id: userId })
      if (!user) throw new NotFoundException('User not found')
      attendance = new MatchAttendance()
      attendance.match = match
      attendance.user = user
      this.em.persist(attendance)
    }

    if (data.status === AttendanceStatus.Present) {
      const presentCount = await this.em.count(MatchAttendance, {
        match: { id: matchId },
        status: AttendanceStatus.Present,
        user: { id: { $ne: userId } },
      })
      if (presentCount >= match.maxCapacity) {
        throw new BadRequestException('Match is at full capacity')
      }
    }

    attendance.status = data.status
    attendance.respondedAt = new Date()
    await this.em.flush()
    return attendance
  }

  async listAttendances(
    organizationId: string,
    userId: string,
    matchId: string,
  ): Promise<MatchAttendance[]> {
    await this.get(organizationId, userId, matchId)
    return this.em.find(
      MatchAttendance,
      { match: { id: matchId } },
      { populate: ['user'], orderBy: { createdAt: 'ASC' } },
    )
  }

  /**
   * Admin override: set any player's attendance at any time (before or after the match).
   * Clearing presence also removes them from the lineup.
   */
  async setAttendance(
    organizationId: string,
    adminUserId: string,
    matchId: string,
    targetUserId: string,
    data: SetAttendanceInput,
  ): Promise<MatchAttendance> {
    await this.organizationService.requireRole(organizationId, adminUserId, ['owner', 'admin'])
    const match = await this.get(organizationId, adminUserId, matchId)
    if (match.status === MatchStatus.Cancelled) {
      throw new BadRequestException('Cannot update attendance on a cancelled match')
    }

    let attendance = await this.em.findOne(
      MatchAttendance,
      { match: { id: matchId }, user: { id: targetUserId } },
      { populate: ['user', 'match'] },
    )
    if (!attendance) {
      const user = await this.em.findOne(User, { id: targetUserId })
      if (!user) throw new NotFoundException('User not found')
      await this.organizationService.requireMember(organizationId, targetUserId)
      attendance = new MatchAttendance()
      attendance.match = match
      attendance.user = user
      this.em.persist(attendance)
    }

    attendance.status = data.status
    attendance.respondedAt = new Date()

    if (data.status !== AttendanceStatus.Present) {
      const lineup = await this.em.findOne(MatchLineup, {
        match: { id: matchId },
        user: { id: targetUserId },
      })
      if (lineup) this.em.remove(lineup)
    }

    await this.em.flush()
    return attendance
  }

  async setLineup(
    organizationId: string,
    userId: string,
    matchId: string,
    data: SetLineupInput,
  ): Promise<MatchLineup[]> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const match = await this.get(organizationId, userId, matchId)
    if (match.status === MatchStatus.Cancelled) {
      throw new BadRequestException('Cannot update lineup on a cancelled match')
    }

    const existing = await this.em.find(MatchLineup, { match: { id: matchId } })
    for (const row of existing) this.em.remove(row)

    const lineups: MatchLineup[] = []
    for (const assignment of data.assignments) {
      const user = await this.em.findOne(User, { id: assignment.userId })
      if (!user) continue

      // Being in the lineup implies the player was present.
      await this.ensurePresentAttendance(match, user)

      const lineup = new MatchLineup()
      lineup.match = match
      lineup.user = user
      lineup.team = assignment.team
      this.em.persist(lineup)
      lineups.push(lineup)
    }
    await this.em.flush()
    return lineups
  }

  private async ensurePresentAttendance(match: Match, user: User): Promise<void> {
    let attendance = await this.em.findOne(MatchAttendance, {
      match: { id: match.id },
      user: { id: user.id },
    })
    if (!attendance) {
      attendance = new MatchAttendance()
      attendance.match = match
      attendance.user = user
      this.em.persist(attendance)
    }
    if (attendance.status !== AttendanceStatus.Present) {
      attendance.status = AttendanceStatus.Present
      attendance.respondedAt = new Date()
    }
  }

  async setPlayerTeam(
    organizationId: string,
    adminUserId: string,
    matchId: string,
    targetUserId: string,
    team: TeamSide | null,
  ): Promise<MatchLineup[]> {
    await this.organizationService.requireRole(organizationId, adminUserId, ['owner', 'admin'])
    const match = await this.get(organizationId, adminUserId, matchId)
    if (match.status === MatchStatus.Cancelled) {
      throw new BadRequestException('Cannot update lineup on a cancelled match')
    }

    const user = await this.em.findOne(User, { id: targetUserId })
    if (!user) throw new NotFoundException('User not found')
    await this.organizationService.requireMember(organizationId, targetUserId)

    let lineup = await this.em.findOne(MatchLineup, {
      match: { id: matchId },
      user: { id: targetUserId },
    })

    if (team === null) {
      if (lineup) this.em.remove(lineup)
    } else {
      await this.ensurePresentAttendance(match, user)
      if (!lineup) {
        lineup = new MatchLineup()
        lineup.match = match
        lineup.user = user
        this.em.persist(lineup)
      }
      lineup.team = team
    }

    await this.em.flush()
    return this.listLineups(organizationId, adminUserId, matchId)
  }

  async listLineups(
    organizationId: string,
    userId: string,
    matchId: string,
  ): Promise<MatchLineup[]> {
    await this.get(organizationId, userId, matchId)
    return this.em.find(
      MatchLineup,
      { match: { id: matchId } },
      { populate: ['user'], orderBy: { team: 'ASC' } },
    )
  }

  async markPlayed(organizationId: string, userId: string, matchId: string): Promise<Match> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const match = await this.get(organizationId, userId, matchId)
    match.status = MatchStatus.Played
    await this.em.flush()
    return match
  }
}
