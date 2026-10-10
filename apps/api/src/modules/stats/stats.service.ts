import { EntityManager } from '@mikro-orm/core'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Organization, User } from '../auth/auth.entity'
import { OrganizationService } from '../auth/organization.service'
import { AttendanceStatus, MatchStatus } from '../matches/contracts/match.contract'
import { MatchAttendance } from '../matches/match-attendance.entity'
import { MatchLineup } from '../matches/match-lineup.entity'
import { Match } from '../matches/match.entity'
import { SeasonStatus } from '../seasons/contracts/season.contract'
import { PlayerVoteService } from '../matches/player-vote.service'
import { Season } from '../seasons/season.entity'
import {
  PlayerDetailDto,
  PlayerSkillRatingsDto,
  SeasonHomeStatsDto,
  UpdatePlayerSkillsInput,
  UpsertMatchStatsInput,
} from './contracts/stats.contract'
import { MatchStat } from './match-stat.entity'
import { PlayerSkill } from './player-skill.entity'
import { buildSkillRatings, skillKeysForSport } from './player-skills'
import {
  computeSeasonHomeStats,
  createEmptyHomeStats,
  type ComputeSeasonHomeStatsInput,
  type HomeStatsGoalRow,
  type HomeStatsLineupRow,
  type HomeStatsPlayerRow,
} from './season-home-stats'

interface SeasonActivity {
  season: { id: string; name: string } | null
  matches: Match[]
  attendances: MatchAttendance[]
  lineups: MatchLineup[]
  stats: MatchStat[]
}

@Injectable()
export class StatsService {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService,
    private readonly playerVoteService: PlayerVoteService,
  ) {}

  async upsertMatchStats(
    organizationId: string,
    userId: string,
    matchId: string,
    data: UpsertMatchStatsInput,
  ): Promise<MatchStat[]> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const match = await this.em.findOne(Match, {
      id: matchId,
      organization: { id: organizationId },
    })
    if (!match) throw new NotFoundException('Match not found')

    const result: MatchStat[] = []
    for (const row of data.stats) {
      const user = await this.em.findOne(User, { id: row.userId })
      if (!user) continue
      let stat = await this.em.findOne(
        MatchStat,
        { match: { id: matchId }, user: { id: row.userId } },
        { populate: ['user', 'match'] },
      )
      if (!stat) {
        stat = new MatchStat()
        stat.match = match
        stat.user = user
        this.em.persist(stat)
      }
      stat.goals = row.goals
      stat.assists = row.assists
      result.push(stat)
    }
    match.status = MatchStatus.Played
    await this.em.flush()
    await this.playerVoteService.sync(match)
    return result
  }

  async listMatchStats(
    organizationId: string,
    userId: string,
    matchId: string,
  ): Promise<MatchStat[]> {
    await this.organizationService.requireMember(organizationId, userId)
    return this.em.find(
      MatchStat,
      { match: { id: matchId, organization: { id: organizationId } } },
      { populate: ['user', 'match'] },
    )
  }

  async seasonAggregates(
    organizationId: string,
    userId: string,
    seasonId: string,
  ): Promise<
    Array<{
      userId: string
      userName: string
      image: string | null
      goals: number
      assists: number
      matchesPlayed: number
    }>
  > {
    await this.organizationService.requireMember(organizationId, userId)
    const stats = await this.em.find(
      MatchStat,
      {
        match: {
          season: { id: seasonId },
          organization: { id: organizationId },
          status: MatchStatus.Played,
        },
      },
      { populate: ['user', 'match'] },
    )

    const map = new Map<
      string,
      {
        userId: string
        userName: string
        image: string | null
        goals: number
        assists: number
        matchesPlayed: number
      }
    >()
    for (const s of stats) {
      const current = map.get(s.user.id) ?? {
        userId: s.user.id,
        userName: s.user.name,
        image: s.user.image,
        goals: 0,
        assists: 0,
        matchesPlayed: 0,
      }
      current.goals += s.goals
      current.assists += s.assists
      current.matchesPlayed += 1
      map.set(s.user.id, current)
    }
    return Array.from(map.values()).sort((a, b) => b.goals - a.goals)
  }

  /**
   * Club and personal highlights for the latest active season.
   */
  async getHomeStats(organizationId: string, userId: string): Promise<SeasonHomeStatsDto> {
    await this.organizationService.requireMember(organizationId, userId)
    const activity = await this.loadActiveSeasonActivity(organizationId)
    if (!activity.season || activity.matches.length === 0) {
      return createEmptyHomeStats(activity.season)
    }

    const home = computeSeasonHomeStats(this.toHomeStatsInput(activity, userId))
    home.club.lastElectedPlayer = await this.playerVoteService.findLastElectedPlayer(
      activity.matches,
    )
    home.club.openPlayerVoteMatchId = this.playerVoteService.findOpenPlayerVoteMatchId(
      activity.matches,
    )
    return home
  }

  /**
   * Profile and active-season totals for one club member.
   */
  async getPlayerDetail(
    organizationId: string,
    viewerUserId: string,
    playerUserId: string,
  ): Promise<PlayerDetailDto> {
    await this.organizationService.requireMember(organizationId, viewerUserId)
    const member = await this.organizationService.getMember(organizationId, playerUserId)
    if (!member) throw new NotFoundException('Player not found')

    const activity = await this.loadActiveSeasonActivity(organizationId)
    const stats = emptyPlayerStats()
    if (activity.season && activity.matches.length > 0) {
      const home = computeSeasonHomeStats(this.toHomeStatsInput(activity, playerUserId))
      stats.matchesPlayed = home.me.matchesPlayed
      stats.goals = home.me.goals
      stats.wins = home.me.wins
      stats.losses = home.me.losses
      stats.assists = sumAssists(activity.stats, playerUserId)
    }

    return {
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      phone: member.user.phone?.trim() || null,
      image: member.user.image,
      role: member.role,
      memberSince: member.createdAt,
      season: activity.season,
      stats,
      skillRatings: await this.loadSkillRatings(
        organizationId,
        playerUserId,
        member.organization.sportType,
      ),
    }
  }

  /**
   * Self-assessed skill levels for the club sport.
   * The player can edit their own ratings. Club admins can edit any member.
   */
  async updatePlayerSkills(
    organizationId: string,
    actorUserId: string,
    playerUserId: string,
    data: UpdatePlayerSkillsInput,
  ): Promise<PlayerSkillRatingsDto> {
    if (actorUserId === playerUserId) {
      await this.organizationService.requireMember(organizationId, actorUserId)
    } else {
      await this.organizationService.requireRole(organizationId, actorUserId, ['owner', 'admin'])
    }

    const player = await this.organizationService.getMember(organizationId, playerUserId)
    if (!player) throw new NotFoundException('Player not found')

    const sportType = player.organization.sportType
    const allowed = skillKeysForSport(sportType)
    if (!allowed) throw new BadRequestException('This sport has no skill ratings')

    const hasUnknownSkill = data.skills.some((row) => !allowed.includes(row.key))
    if (hasUnknownSkill) throw new BadRequestException('Unknown skill for this sport')

    const nextValues = new Map<string, number>()
    for (const row of data.skills) {
      nextValues.set(row.key, row.value)
    }

    for (const [key, value] of nextValues) {
      let skill = await this.em.findOne(PlayerSkill, {
        organization: organizationId,
        user: playerUserId,
        skill: key,
      })
      if (!skill) {
        skill = new PlayerSkill()
        skill.organization = this.em.getReference(Organization, organizationId)
        skill.user = this.em.getReference(User, playerUserId)
        skill.skill = key
        this.em.persist(skill)
      }
      skill.value = value
    }
    await this.em.flush()

    const ratings = await this.loadSkillRatings(organizationId, playerUserId, sportType)
    if (!ratings) throw new BadRequestException('This sport has no skill ratings')
    return ratings
  }

  private async loadSkillRatings(
    organizationId: string,
    playerUserId: string,
    sportType: Organization['sportType'],
  ): Promise<PlayerSkillRatingsDto | null> {
    if (!skillKeysForSport(sportType)) return null
    const stored = await this.em.find(PlayerSkill, {
      organization: organizationId,
      user: playerUserId,
    })
    return buildSkillRatings(sportType, stored)
  }

  private async loadActiveSeasonActivity(organizationId: string): Promise<SeasonActivity> {
    const season = await this.em.findOne(
      Season,
      { organization: { id: organizationId }, status: SeasonStatus.Active },
      { orderBy: { startsAt: 'DESC' } },
    )
    if (!season) {
      return { season: null, matches: [], attendances: [], lineups: [], stats: [] }
    }

    const seasonRef = { id: season.id, name: season.name }
    const matches = await this.em.find(Match, {
      organization: { id: organizationId },
      season: { id: season.id },
      status: MatchStatus.Played,
    })
    if (matches.length === 0) {
      return { season: seasonRef, matches: [], attendances: [], lineups: [], stats: [] }
    }

    const matchIds = matches.map((match) => match.id)
    const [attendances, lineups, stats] = await Promise.all([
      this.em.find(
        MatchAttendance,
        { match: { id: { $in: matchIds } }, status: AttendanceStatus.Present },
        { populate: ['user', 'match'] },
      ),
      this.em.find(
        MatchLineup,
        { match: { id: { $in: matchIds } } },
        { populate: ['user', 'match'] },
      ),
      this.em.find(
        MatchStat,
        { match: { id: { $in: matchIds } } },
        { populate: ['user', 'match'] },
      ),
    ])

    return { season: seasonRef, matches, attendances, lineups, stats }
  }

  private toHomeStatsInput(
    activity: SeasonActivity,
    viewerUserId: string,
  ): ComputeSeasonHomeStatsInput {
    return {
      season: activity.season,
      viewerUserId,
      matches: activity.matches.map((match) => ({
        id: match.id,
        blueScore: match.blueScore,
        redScore: match.redScore,
      })),
      attendances: activity.attendances.map(toPlayerRow),
      lineups: activity.lineups.map(toLineupRow),
      goals: activity.stats.map(toGoalRow),
    }
  }
}

function toPlayerRow(row: MatchAttendance): HomeStatsPlayerRow {
  return {
    matchId: row.match.id,
    userId: row.user.id,
    userName: row.user.name,
    image: row.user.image,
  }
}

function toLineupRow(row: MatchLineup): HomeStatsLineupRow {
  return {
    matchId: row.match.id,
    userId: row.user.id,
    userName: row.user.name,
    image: row.user.image,
    team: row.team,
  }
}

function emptyPlayerStats(): PlayerDetailDto['stats'] {
  return {
    matchesPlayed: 0,
    goals: 0,
    assists: 0,
    wins: 0,
    losses: 0,
  }
}

function sumAssists(stats: MatchStat[], userId: string): number {
  let total = 0
  for (const stat of stats) {
    if (stat.user.id !== userId) continue
    total += stat.assists
  }
  return total
}

function toGoalRow(row: MatchStat): HomeStatsGoalRow {
  return {
    matchId: row.match.id,
    userId: row.user.id,
    userName: row.user.name,
    image: row.user.image,
    goals: row.goals,
  }
}
