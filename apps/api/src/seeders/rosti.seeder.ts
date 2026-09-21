/* oxlint-disable no-console */

import { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { createUserData } from '../modules/auth/auth.factory'
import { Member, Organization, SportType, User } from '../modules/auth/auth.entity'
import {
  AttendanceStatus,
  MatchStatus,
  RecurrenceFrequency,
  TeamSide,
} from '../modules/matches/contracts/match.contract'
import { MatchAttendance } from '../modules/matches/match-attendance.entity'
import { MatchLineup } from '../modules/matches/match-lineup.entity'
import { MatchSeries } from '../modules/matches/match-series.entity'
import { Match } from '../modules/matches/match.entity'
import { SeasonStatus } from '../modules/seasons/contracts/season.contract'
import { Season } from '../modules/seasons/season.entity'
import { MatchStat } from '../modules/stats/match-stat.entity'

const DEV_PASSWORD = 'password123!'
const PAST_MATCH_COUNT = 10
const KICKOFF_WEEKDAY = 2
const KICKOFF_HOUR = 20
const MIN_PRESENT_PLAYERS = 10
const MAX_GOALS = 8

const ADMIN = {
  name: 'Admin Rösti',
  firstName: 'Admin',
  lastName: 'Rösti',
  email: 'admin@admin.fr',
  password: DEV_PASSWORD,
}

const CLUB = {
  name: 'Rösti FC',
  slug: 'rosti-fc',
  venue: 'Stade des Développeurs',
  sportType: SportType.Football,
  defaultMaxCapacity: 14,
}

const PLAYERS: Array<{ firstName: string; lastName: string }> = [
  { firstName: 'Lucas', lastName: 'Martin' },
  { firstName: 'Hugo', lastName: 'Bernard' },
  { firstName: 'Louis', lastName: 'Dubois' },
  { firstName: 'Gabriel', lastName: 'Thomas' },
  { firstName: 'Arthur', lastName: 'Robert' },
  { firstName: 'Jules', lastName: 'Richard' },
  { firstName: 'Adam', lastName: 'Petit' },
  { firstName: 'Leo', lastName: 'Durand' },
  { firstName: 'Raphael', lastName: 'Leroy' },
  { firstName: 'Nathan', lastName: 'Moreau' },
  { firstName: 'Ethan', lastName: 'Simon' },
  { firstName: 'Paul', lastName: 'Laurent' },
  { firstName: 'Tom', lastName: 'Lefebvre' },
  { firstName: 'Noah', lastName: 'Michel' },
  { firstName: 'Theo', lastName: 'Garcia' },
]

/**
 * Development seeder: one club owner, one club, 15 players, a season, and past matches.
 *
 * Login: admin@admin.fr / password123!
 * Players: player01@rosti.dev … player15@rosti.dev / password123!
 */
export class RostiSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const admin = await createUserData(
      em,
      {
        name: ADMIN.name,
        firstName: ADMIN.firstName,
        lastName: ADMIN.lastName,
        email: ADMIN.email,
        emailVerified: true,
      },
      ADMIN.password,
    )

    const organization = em.create(Organization, {
      name: CLUB.name,
      slug: CLUB.slug,
      venue: CLUB.venue,
      sportType: CLUB.sportType,
      defaultMaxCapacity: CLUB.defaultMaxCapacity,
      createdAt: new Date(),
    })

    const adminMembership = em.create(Member, {
      user: admin,
      organization,
      role: 'owner',
      createdAt: new Date(),
    })

    await em.persist([organization, adminMembership]).flush()

    const members: User[] = [admin]

    for (let index = 0; index < PLAYERS.length; index++) {
      const player = PLAYERS[index]
      const email = `player${String(index + 1).padStart(2, '0')}@rosti.dev`
      const name = `${player.firstName} ${player.lastName}`

      const user = await createUserData(
        em,
        {
          name,
          firstName: player.firstName,
          lastName: player.lastName,
          email,
          emailVerified: true,
        },
        DEV_PASSWORD,
      )

      const membership = em.create(Member, {
        user,
        organization,
        role: 'member',
        createdAt: new Date(),
      })

      await em.persist(membership).flush()
      members.push(user)
    }

    await seedSeasonWithPastMatches({ em, organization, createdBy: admin, members })

    console.info('RostiSeeder: admin@admin.fr / password123!')
    console.info(`RostiSeeder: club "${CLUB.name}" with ${PLAYERS.length} players`)
    console.info(`RostiSeeder: ${PAST_MATCH_COUNT} past matches with scores and lineups`)
  }
}

interface SeedSeasonInput {
  em: EntityManager
  organization: Organization
  createdBy: User
  members: User[]
}

async function seedSeasonWithPastMatches(input: SeedSeasonInput): Promise<void> {
  const { em, organization, createdBy, members } = input
  const lastKickoff = getLastPastKickoff(new Date(), KICKOFF_WEEKDAY, KICKOFF_HOUR)
  const oldestKickoff = shiftWeeks(lastKickoff, -(PAST_MATCH_COUNT - 1))
  const seasonStartsAt = startOfMonth(shiftMonths(oldestKickoff, -1))

  const season = em.create(Season, {
    organization,
    name: `Saison ${seasonStartsAt.getFullYear()}`,
    startsAt: seasonStartsAt,
    status: SeasonStatus.Active,
    createdAt: seasonStartsAt,
    updatedAt: seasonStartsAt,
  })
  em.persist(season)

  const series = em.create(MatchSeries, {
    organization,
    season,
    title: 'Match interne',
    location: CLUB.venue,
    maxCapacity: CLUB.defaultMaxCapacity,
    frequency: RecurrenceFrequency.Weekly,
    startsAt: oldestKickoff,
    createdBy,
    createdAt: oldestKickoff,
  })
  em.persist(series)
  await em.flush()

  const matches: Match[] = []
  for (let index = 0; index < PAST_MATCH_COUNT; index++) {
    const startsAt = shiftWeeks(oldestKickoff, index)
    const createdAt = shiftDays(startsAt, -5)
    const match = em.create(Match, {
      organization,
      season,
      series,
      title: series.title,
      startsAt,
      location: CLUB.venue,
      maxCapacity: CLUB.defaultMaxCapacity,
      status: MatchStatus.Played,
      blueScore: randomInt(0, MAX_GOALS),
      redScore: randomInt(0, MAX_GOALS),
      createdBy,
      createdAt,
      updatedAt: startsAt,
    })
    em.persist(match)
    matches.push(match)
  }
  await em.flush()

  for (const match of matches) {
    seedPlayedMatchDetails({ em, match, members })
  }
  await em.flush()
}

interface SeedPlayedMatchDetailsInput {
  em: EntityManager
  match: Match
  members: User[]
}

function seedPlayedMatchDetails(input: SeedPlayedMatchDetailsInput): void {
  const { em, match, members } = input
  const presentCount = randomInt(
    Math.min(MIN_PRESENT_PLAYERS, members.length),
    Math.min(match.maxCapacity, members.length),
  )
  const shuffledMembers = shuffle(members)
  const presentPlayers = shuffledMembers.slice(0, presentCount)
  const absentPlayers = shuffledMembers.slice(presentCount)
  const teams = splitTeams(presentPlayers)

  for (const user of presentPlayers) {
    em.persist(createAttendance({ em, match, user, status: AttendanceStatus.Present }))
  }
  for (const user of absentPlayers) {
    em.persist(createAttendance({ em, match, user, status: AttendanceStatus.Absent }))
  }

  for (const user of teams.blue) {
    em.persist(createLineup({ em, match, user, team: TeamSide.Blue }))
  }
  for (const user of teams.red) {
    em.persist(createLineup({ em, match, user, team: TeamSide.Red }))
  }

  const statDrafts = [
    ...assignTeamStats(teams.blue, match.blueScore ?? 0),
    ...assignTeamStats(teams.red, match.redScore ?? 0),
  ]
  for (const draft of statDrafts) {
    em.persist(
      em.create(MatchStat, {
        match,
        user: draft.user,
        goals: draft.goals,
        assists: draft.assists,
        createdAt: match.startsAt,
        updatedAt: match.startsAt,
      }),
    )
  }
}

interface AttendanceInput {
  em: EntityManager
  match: Match
  user: User
  status: AttendanceStatus
}

function createAttendance(input: AttendanceInput): MatchAttendance {
  const respondedAt = shiftDays(input.match.startsAt, -randomInt(1, 4))
  respondedAt.setHours(randomInt(8, 22), randomInt(0, 59), 0, 0)

  return input.em.create(MatchAttendance, {
    match: input.match,
    user: input.user,
    status: input.status,
    respondedAt,
    createdAt: respondedAt,
    updatedAt: respondedAt,
  })
}

interface LineupInput {
  em: EntityManager
  match: Match
  user: User
  team: TeamSide
}

function createLineup(input: LineupInput): MatchLineup {
  return input.em.create(MatchLineup, {
    match: input.match,
    user: input.user,
    team: input.team,
    createdAt: input.match.startsAt,
    updatedAt: input.match.startsAt,
  })
}

interface TeamSplit {
  blue: User[]
  red: User[]
}

function splitTeams(players: User[]): TeamSplit {
  const shuffled = shuffle(players)
  const mid = Math.ceil(shuffled.length / 2)
  return {
    blue: shuffled.slice(0, mid),
    red: shuffled.slice(mid),
  }
}

interface PlayerStatDraft {
  user: User
  goals: number
  assists: number
}

function assignTeamStats(players: User[], teamGoals: number): PlayerStatDraft[] {
  if (players.length === 0 || teamGoals === 0) {
    return []
  }

  const drafts: PlayerStatDraft[] = players.map((user) => ({ user, goals: 0, assists: 0 }))
  for (let index = 0; index < teamGoals; index++) {
    const scorerIndex = randomInt(0, players.length - 1)
    drafts[scorerIndex].goals += 1
    if (players.length < 2 || Math.random() >= 0.7) {
      continue
    }
    let assistIndex = randomInt(0, players.length - 1)
    if (assistIndex === scorerIndex) {
      assistIndex = (assistIndex + 1) % players.length
    }
    drafts[assistIndex].assists += 1
  }

  return drafts.filter((draft) => draft.goals > 0 || draft.assists > 0)
}

function getLastPastKickoff(now: Date, weekday: number, hour: number): Date {
  const kickoff = new Date(now)
  kickoff.setHours(hour, 0, 0, 0)
  const daysSinceWeekday = (kickoff.getDay() - weekday + 7) % 7
  kickoff.setDate(kickoff.getDate() - daysSinceWeekday)
  if (kickoff.getTime() >= now.getTime()) {
    kickoff.setDate(kickoff.getDate() - 7)
  }
  return kickoff
}

function shiftWeeks(date: Date, weeks: number): Date {
  return shiftDays(date, weeks * 7)
}

function shiftDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function shiftMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = randomInt(0, index)
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}
